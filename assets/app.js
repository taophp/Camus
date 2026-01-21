/*
  musetag.github.io/assets/app.js

  MuseTag demo application script.

  - Parses MuseTag annotations in the editor pane.
  - Builds an internal representation of entities and occurrences.
  - Renders preview, entity cards, timeline and document outline.
  - Now supports hierarchical properties: ChildOf / ParentOf and their sugar forms.

  NOTE: This file is an edited/extended version of the demo script to add
  hierarchical relations support and to show relations in entity cards.
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const editor = document.getElementById("musetag-editor");
  const previewOutput = document.getElementById("preview-output");
  const viewMdBtn = document.getElementById("view-md-btn");
  const viewHtmlBtn = document.getElementById("view-html-btn");
  const characterEntitiesContainer =
    document.getElementById("character-entities");
  const otherEntitiesContainer = document.getElementById("other-entities");

  // --- State ---
  const state = {
    viewMode: "html", // 'md' or 'html'
    rawText: "",
    cleanText: "",
    entities: new Map(), // Use a Map to store entities, keyed by canonical name
    documentOutline: [],
  };
  const LOCAL_STORAGE_KEY = "musetag-demo-text";

  // --- Helpers for relation handling ---

  // Mapping of sugar names to canonical relation direction
  // We'll normalize into 'parent'/'child' directional operations.
  const hierarchicalSugar = {
    ChildOf: "childOf", // entity.ChildOf(target) -> entity is child, target is parent
    ParentOf: "parentOf",
    PartOf: "childOf",
    HasPart: "parentOf",
    BelongsTo: "childOf",
    Includes: "parentOf",
    MemberOf: "childOf",
    GroupOf: "parentOf",
    ContainedIn: "childOf",
    ContainerOf: "parentOf",
    DescendantOf: "childOf",
    AncestorOf: "parentOf",
  };

  // Utility: find canonical name for a token using declaredEntities map
  function resolveCanonicalName(token, declaredEntities) {
    if (!token) return null;
    // If token appears like an annotation (maybe with underscores), normalize it
    const t = token.trim();

    // Try direct canonical match (spaces preserved)
    if (declaredEntities.has(t)) {
      return t;
    }

    // Try underscore <-> space variants
    const withSpaces = t.replace(/_/g, " ");
    if (declaredEntities.has(withSpaces)) return withSpaces;

    const withUnderscores = t.replace(/ /g, "_");
    // declaredEntities stores underscore variants as keys sometimes
    if (declaredEntities.has(withUnderscores)) {
      // declaredEntities keys are canonical names (with spaces) in our parser,
      // but some entries also map raw underscore forms as keys to raw names.
      // Try to find canonical by scanning values
      const raw = declaredEntities.get(withUnderscores);
      if (raw) return raw.replace(/_/g, " ");
    }

    // Try case-insensitive search among canonical names
    const lower = t.toLowerCase();
    for (const key of declaredEntities.keys()) {
      if (key.toLowerCase() === lower) return key;
    }

    // Finally, try to match a declared rawName value (values in declaredEntities)
    for (const [canonical, rawName] of declaredEntities.entries()) {
      if (
        rawName === t ||
        rawName === withUnderscores ||
        rawName === withSpaces
      ) {
        return canonical;
      }
      if ((rawName || "").toLowerCase() === lower) return canonical;
    }

    return null;
  }

  // Add relation between two entities (canonical names). position is optional
  function addRelation(
    entitiesMap,
    fromCanonical,
    relationDirection,
    toCanonical,
    position = null,
  ) {
    if (!fromCanonical || !toCanonical) return;

    // Ensure both entities exist
    if (!entitiesMap.has(fromCanonical)) {
      entitiesMap.set(fromCanonical, createPlaceholderEntity(fromCanonical));
    }
    if (!entitiesMap.has(toCanonical)) {
      entitiesMap.set(toCanonical, createPlaceholderEntity(toCanonical));
    }

    const fromEntity = entitiesMap.get(fromCanonical);
    const toEntity = entitiesMap.get(toCanonical);

    // relationDirection is 'childOf' or 'parentOf'
    if (relationDirection === "childOf") {
      // fromEntity is child, toEntity is parent
      // Add to fromEntity.parents and toEntity.children
      if (!fromEntity.parents.some((p) => p.name === toCanonical)) {
        fromEntity.parents.push({ name: toCanonical, position });
      }
      if (!toEntity.children.some((c) => c.name === fromCanonical)) {
        toEntity.children.push({ name: fromCanonical, position });
      }
    } else if (relationDirection === "parentOf") {
      // fromEntity is parent, toEntity is child
      if (!fromEntity.children.some((c) => c.name === toCanonical)) {
        fromEntity.children.push({ name: toCanonical, position });
      }
      if (!toEntity.parents.some((p) => p.name === fromCanonical)) {
        toEntity.parents.push({ name: fromCanonical, position });
      }
    }
  }

  // Create a placeholder entity (minimal structure) if referenced before declared
  function createPlaceholderEntity(canonicalName) {
    return {
      name: canonicalName,
      type: "character",
      hierarchyLevel: 1,
      globalInfo: new Map(),
      occurrences: [],
      manuallyExpanded: false,
      contextuallyExpanded: false,
      parsedAbsoluteDate: null,
      aliases: [],
      color: null,
      parents: [],
      children: [],
    };
  }

  // --- Parser ---

  /**
   * Extracts a clean, readable text from a MuseTag string,
   * according to the "Cleanup Parser" rules.
   * This is a simplified parser for the preview feature.
   * @param {string} rawText The text containing MuseTag annotations.
   * @returns {string} The cleaned-up text for final display.
   */
  function getCleanText(rawText) {
    if (!rawText) return "";

    let text = rawText;

    // 1. First pass: Remove hidden structure annotations like @@.(# Title) specifically
    text = text.replace(/@@\.\([^)]*\)/g, "");

    // 2. Second pass: Remove null entity patterns without visible parameters
    //    - @@. (bare null entity)
    //    - @@.property(hidden) patterns
    text = text.replace(/@@\.(?:[\w:!?]+(?:\([^)]*\))?)?(?!\[)/g, "");

    // 4. Fourth pass: Process annotations that are meant to be visible.
    //    This includes:
    //    - @@EntityName
    //    - @@EntityName.property[VisibleContent]
    //    - @@(HiddenEntity)[VisibleContent]
    //    - @@.[VisibleContent]
    const visibleAnnotationRegex =
      /@@(?:([\p{L}\p{N}_]+)|\(([^)]+)\)|(\.))((?:\.[\w:!?]+(?:(?:\([^)]*\)|\[[^\]]*\]))?)*)/gu;

    text = text.replace(
      visibleAnnotationRegex,
      (fullMatch, visibleName, hiddenContent, isNullDot, modifiersStr) => {
        // Extract content from visible parameters `[...]` only.
        const visibleParamRegex = /\[([^\]]*)\]/g;
        let visibleParamsOutput = "";
        let match;
        while ((match = visibleParamRegex.exec(modifiersStr)) !== null) {
          visibleParamsOutput += match[1];
        }

        // If it's a visible entity, output its name + visible params.
        if (visibleName) {
          let separator = "";
          // Add space if visibleParamsOutput doesn't start with punctuation
          // Punctuation chars that shouldn't have preceding space: . , : ; ? ! )
          if (
            visibleParamsOutput.length > 0 &&
            !/^[.,:;?!)]/.test(visibleParamsOutput)
          ) {
            separator = " ";
          }
          return (
            visibleName.replace(/_/g, " ") + separator + visibleParamsOutput
          );
        }

        // If it's a hidden entity or null entity with visible parameters, output only the visible parameters.
        if ((hiddenContent || isNullDot) && visibleParamsOutput.length > 0) {
          return visibleParamsOutput;
        }

        // This case should ideally not be reached, as fully hidden ones should be gone.
        // But as a fallback, return empty.
        return "";
      },
    );

    // 5. Final cleanup: Remove any remaining property syntax that wasn't part of a match,
    //    e.g. .property or .property(hidden) that was left over due to partial replacement
    text = text.replace(/\.[\w:!?]+(?:\([^)]*\))?/g, "");

    return text;
  }

  /**
   * Parses the MuseTag text to extract entities and their metadata.
   * @param {string} rawText The text containing MuseTag annotations.
   * @returns {{cleanText: string, entities: Map<string, object>, documentOutline: Array}}
   */
  function parseMuseTag(rawText) {
    const cleanText = getCleanText(rawText);
    const entities = new Map();
    const documentOutline = [];
    const declaredEntities = new Map(); // Track canonical names -> rawName

    // Find hidden markdown headers like @@.(# Title) - they should appear in TOC but not in preview
    const hiddenHeaderRegex = /@@\.\((#+)\s*([^)]*)\)/g;
    let headerMatch;
    while ((headerMatch = hiddenHeaderRegex.exec(rawText)) !== null) {
      documentOutline.push({
        level: headerMatch[1].length,
        text: headerMatch[2].trim(),
        position: headerMatch.index,
      });
    }

    // Find visible markdown headers like # Title
    const visibleHeaderRegex = /^(#+)\s+(.*)$/gm;
    while ((headerMatch = visibleHeaderRegex.exec(rawText)) !== null) {
      // Clean header text from any hidden entity annotations
      let cleanHeaderText = headerMatch[2].trim();

      // Remove hidden entities from header text
      cleanHeaderText = cleanHeaderText.replace(/@@\([^)]+\)/g, "");
      cleanHeaderText = cleanHeaderText.replace(
        /@@\.(?:[\w:!?]+(?:\([^)]*\))?)?(?!\[)/g,
        "",
      );

      // Process visible entities in headers
      cleanHeaderText = cleanHeaderText.replace(
        /@@([\p{L}\p{N}_]+)((?:\.[\w:!?]+(?:(?:\([^)]*\)|\[[^\]]*\]))?)*)/gu,
        (match, entityName, modifiers) => {
          // Extract visible parameters only
          const visibleParams = modifiers.match(/\[([^\]]*)\]/g) || [];
          return (
            entityName.replace(/_/g, " ") +
            visibleParams.join("").replace(/[\[\]]/g, "")
          );
        },
      );

      documentOutline.push({
        level: headerMatch[1].length,
        text: cleanHeaderText,
        position: headerMatch.index,
      });
    }

    // Sort the combined outline by position in the text
    documentOutline.sort((a, b) => a.position - b.position);

    // STEP 1: Parse all @@ annotations to build declared entities list
    const annotationRegex =
      /(@{2,4})(?:([\p{L}\p{N}_]+)|\(([^)]+)\))((?:\.[\w:!?]+(?:(?:\(([^)]*)\)|\[[^\]]*\]))?)*)/gu;

    let match;
    while ((match = annotationRegex.exec(rawText)) !== null) {
      const hierarchyMarkers = match[1]; // @@, @@@, or @@@@
      const hierarchyLevel = hierarchyMarkers.length - 1; // 1=main, 2=secondary, 3=minor
      const rawName = match[2] || match[3];
      const isHidden = !!match[3];
      const modifiersString = match[4] || "";

      // Support grouping syntax: if a hidden name contains commas, treat it as multiple entity declarations
      const rawNamesList =
        isHidden && typeof rawName === "string" && rawName.includes(",")
          ? rawName
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [rawName];

      for (const singleRawName of rawNamesList) {
        const entityName = (singleRawName || "").replace(/_/g, " ");

        let parsedAbsoluteDate = null;
        let isTemporal = isHidden && /^[0-9@-]/.test(singleRawName);

        if (isTemporal) {
          const dateToParse = singleRawName.replace(" ", "T");
          const tempDate = new Date(dateToParse);
          if (!isNaN(tempDate.getTime())) {
            parsedAbsoluteDate = tempDate;
          }
        }

        // Track this as a declared entity (both canonical name and underscore version)
        declaredEntities.set(entityName, singleRawName);
        if (singleRawName && singleRawName.includes("_")) {
          declaredEntities.set(singleRawName, singleRawName); // Also track underscore version
        }

        if (!entities.has(entityName)) {
          entities.set(entityName, {
            name: entityName,
            type: isTemporal ? "temporal" : "character",
            hierarchyLevel: hierarchyLevel, // 1=main, 2=secondary, 3=minor
            globalInfo: new Map(),
            occurrences: [],
            manuallyExpanded: false,
            contextuallyExpanded: false,
            parsedAbsoluteDate: parsedAbsoluteDate,
            aliases: [],
            color: null,
            parents: [],
            children: [],
          });
        } else {
          // Update hierarchy level - hierarchy markers are persistent
          const existingEntity = entities.get(entityName);
          if (hierarchyLevel > existingEntity.hierarchyLevel) {
            existingEntity.hierarchyLevel = hierarchyLevel;
          }
        }

        const entityData = entities.get(entityName);
        const currentOccurrence = {
          position: match.index,
          localInfo: [],
        };

        // Parse modifiers (apply the same modifiers to each grouped entity)
        const modifierRegex = /\.([\w:!?]+)(?:(?:\(([^)]*)\)|\[([^\]]*)\]))?/g;
        const typeModifiers = ["Character", "Place", "Event", "Object"];
        let modMatch;
        modifierRegex.lastIndex = 0;
        while ((modMatch = modifierRegex.exec(modifiersString)) !== null) {
          const modName = modMatch[1];
          const modValue =
            modMatch[2] !== undefined
              ? modMatch[2]
              : modMatch[3] !== undefined
                ? modMatch[3]
                : null;

          // Handle hierarchical modifiers first (ChildOf / ParentOf and sugars)
          if (hierarchicalSugar.hasOwnProperty(modName)) {
            const relationDirection = hierarchicalSugar[modName]; // 'childOf' or 'parentOf'

            // Attempt to resolve the target entity name(s).
            // Typical usage: .ChildOf(@@Other) or .ChildOf(Other) where Other appears somewhere else as @@Other.
            let resolvedTargets = [];

            if (modValue) {
              // Look for explicit annotation tokens inside modValue first
              const innerAnnotationRegex =
                /(@{2,4})(?:([\p{L}\p{N}_]+)|\(([^)]+)\))/gu;
              let innerMatch;
              while (
                (innerMatch = innerAnnotationRegex.exec(modValue)) !== null
              ) {
                const targetRaw = innerMatch[2] || innerMatch[3];
                const targetCanonical = (targetRaw || "").replace(/_/g, " ");
                resolvedTargets.push(targetCanonical);
              }

              // If none found, try to resolve bare name via declaredEntities
              if (resolvedTargets.length === 0) {
                const maybe = resolveCanonicalName(modValue, declaredEntities);
                if (maybe) resolvedTargets.push(maybe);
              }
            }

            // If still empty, nothing to do (no valid target)
            if (resolvedTargets.length > 0) {
              resolvedTargets.forEach((targetCanonical) => {
                // Add relation entries (use match.index as the position where declared)
                addRelation(
                  entities,
                  entityData.name,
                  relationDirection,
                  targetCanonical,
                  match.index,
                );
              });
            }

            // Continue - don't add this to localInfo globalInfo; hierarchy is stored on parents/children
            continue;
          }

          // Handle standard type modifiers
          if (typeModifiers.includes(modName) && !isTemporal) {
            entityData.type = modName.toLowerCase();
          }

          // Handle custom .Type(value) property
          if (modName === "Type" && modValue && !isTemporal) {
            entityData.type = modValue.toLowerCase();
          }

          if (
            (modName.toUpperCase() === modName &&
              modName.toLowerCase() !== modName) ||
            (typeModifiers.includes(modName) && !isTemporal)
          ) {
            // Global modifiers are cumulative - store all occurrences
            if (entityData.globalInfo.has(modName)) {
              const existing = entityData.globalInfo.get(modName);
              existing.occurrences.push({
                value: modValue,
                position: match.index,
              });
            } else {
              entityData.globalInfo.set(modName, {
                occurrences: [
                  {
                    value: modValue,
                    position: match.index,
                  },
                ],
              });
            }
          } else if (modName === "Alias" && modValue) {
            // Handle .Alias property
            if (!entityData.aliases.includes(modValue)) {
              entityData.aliases.push(modValue);
            }
            // Also add to declared entities so we can find it in the text
            declaredEntities.set(modValue, modValue);
          } else if (modName === "Color" && modValue) {
            // Handle .Color property
            entityData.color = modValue;
          } else {
            currentOccurrence.localInfo.push({
              name: modName,
              value: modValue,
            });
          }
        }

        entityData.occurrences.push(currentOccurrence);
      }
    }

    // STEP 2: Find all canonical name occurrences in the text
    // Reset regex index for second pass
    annotationRegex.lastIndex = 0;

    // Create a list of positions where @@ annotations exist to avoid double-counting
    const annotationPositions = new Set();
    while ((match = annotationRegex.exec(rawText)) !== null) {
      // Mark the range of this annotation as occupied
      const start = match.index;
      const end = match.index + match[0].length;
      for (let i = start; i < end; i++) {
        annotationPositions.add(i);
      }
    }

    // Now look for canonical names in the text
    for (const [canonicalName, rawName] of declaredEntities) {
      // Skip temporal entities as they shouldn't be found as bare names
      if (entities.get(canonicalName)?.type === "temporal") {
        continue;
      }

      // Create regex to find this canonical name
      // We need to escape special regex characters and handle both space and underscore versions
      const escapedName = canonicalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedRawName = rawName
        ? rawName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        : escapedName;

      // Look for word boundaries around the name to avoid partial matches
      const nameRegex = new RegExp(
        `\\b(?:${escapedName}|${escapedRawName})\\b`,
        "g",
      );

      let nameMatch;
      while ((nameMatch = nameRegex.exec(rawText)) !== null) {
        const startPos = nameMatch.index;
        const endPos = startPos + nameMatch[0].length;

        // Check if this occurrence is already covered by an @@ annotation
        let isAlreadyAnnotated = false;
        for (let i = startPos; i < endPos; i++) {
          if (annotationPositions.has(i)) {
            isAlreadyAnnotated = true;
            break;
          }
        }

        // If not already annotated, add it as an occurrence
        if (!isAlreadyAnnotated) {
          const entityData = entities.get(canonicalName);
          if (entityData) {
            entityData.occurrences.push({
              position: startPos,
              localInfo: [],
              isImplicit: true, // Mark as implicit reference
            });
          }
        }
      }
    }

    // Sort occurrences by position for each entity
    for (const entityData of entities.values()) {
      entityData.occurrences.sort((a, b) => a.position - b.position);
    }

    return { cleanText, entities, documentOutline };
  }

  // --- Core Application Logic ---

  function updatePreview() {
    if (state.viewMode === "html") {
      // Ensure the 'marked' library is available
      if (typeof marked !== "undefined") {
        previewOutput.innerHTML = marked.parse(state.cleanText, {
          gfm: true,
          breaks: true,
        });
      } else {
        previewOutput.textContent =
          'Erreur: La librairie de rendu Markdown "marked" est introuvable.';
        console.error("Marked.js library not found.");
      }
    } else {
      // For markdown view, display as plain text
      previewOutput.textContent = state.cleanText;
    }
  }

  function processEditorChange() {
    state.rawText = editor.value;

    const oldEntities = state.entities;
    const {
      cleanText,
      entities: newEntities,
      documentOutline,
    } = parseMuseTag(state.rawText);

    // Preserve the manuallyExpanded state across re-renders
    newEntities.forEach((entity, name) => {
      if (oldEntities.has(name)) {
        entity.manuallyExpanded = oldEntities.get(name).manuallyExpanded;
      }
    });

    state.cleanText = cleanText;
    state.entities = newEntities;
    state.documentOutline = documentOutline;

    updatePreview();
    renderEntities();
    renderDocumentOutline();
    renderHierarchy();
    renderTimeline();
    handleEditorSelectionChange(); // Ensure cards are correctly expanded/collapsed
    saveToLocalStorage();
  }

  /**
   * Finds the paragraph at a given cursor position in the text.
   * A paragraph is a block of text separated by double newlines.
   * @param {string} text The full text.
   * @param {number} position The cursor position.
   * @returns {string} The paragraph containing the cursor.
   */
  function getParagraphAt(text, position) {
    if (!text) return "";

    const textBeforeCursor = text.substring(0, position);
    const textAfterCursor = text.substring(position);

    const lastBoundaryBefore = textBeforeCursor.lastIndexOf("\n\n");
    const start = lastBoundaryBefore === -1 ? 0 : lastBoundaryBefore + 2;

    const firstBoundaryAfter = textAfterCursor.indexOf("\n\n");
    const end =
      firstBoundaryAfter === -1 ? text.length : position + firstBoundaryAfter;

    return text.substring(start, end);
  }

  /**
   * Gets the adjacent paragraphs (previous, current, next) at a given position.
   * @param {string} text The full text.
   * @param {number} position The cursor position.
   * @returns {{previous: string, current: string, next: string}}
   */
  function getAdjacentParagraphs(text, position) {
    if (!text) return { previous: "", current: "", next: "" };

    const textBeforeCursor = text.substring(0, position);
    const textAfterCursor = text.substring(position);

    // Find current paragraph boundaries
    const lastBoundaryBefore = textBeforeCursor.lastIndexOf("\n\n");
    const currentStart = lastBoundaryBefore === -1 ? 0 : lastBoundaryBefore + 2;

    const firstBoundaryAfter = textAfterCursor.indexOf("\n\n");
    const currentEnd =
      firstBoundaryAfter === -1 ? text.length : position + firstBoundaryAfter;

    // Get current paragraph
    const current = text.substring(currentStart, currentEnd);

    // Find previous paragraph
    let previous = "";
    if (currentStart > 0) {
      const beforeCurrent = text.substring(0, currentStart - 2);
      const prevBoundaryBefore = beforeCurrent.lastIndexOf("\n\n");
      const prevStart = prevBoundaryBefore === -1 ? 0 : prevBoundaryBefore + 2;
      previous = text.substring(prevStart, currentStart - 2);
    }

    // Find next paragraph
    let next = "";
    if (currentEnd < text.length) {
      const afterCurrent = text.substring(currentEnd + 2);
      const nextBoundaryAfter = afterCurrent.indexOf("\n\n");
      const nextEnd =
        nextBoundaryAfter === -1
          ? text.length
          : currentEnd + 2 + nextBoundaryAfter;
      next = text.substring(currentEnd + 2, nextEnd);
    }

    return { previous, current, next };
  }

  /**
   * Handles editor selection changes to automatically expand/collapse entity cards.
   */
  function handleEditorSelectionChange() {
    const position = editor.selectionStart;
    if (position === null) return;

    const { previous, current, next } = getAdjacentParagraphs(
      state.rawText,
      position,
    );
    const entitiesInContext = new Set();

    // Collect entities from all three paragraphs
    const contextText = [previous, current, next].join(" ");

    // 1. Find explicit annotations
    const entityRegex = /@@(?:([\p{L}\p{N}_]+)|\(([\p{L}\p{N}_]+)\))/gu;
    let match;
    while ((match = entityRegex.exec(contextText)) !== null) {
      const entityName = (match[1] || match[2]).replace(/_/g, " ");
      entitiesInContext.add(entityName);
    }

    // 2. Find implicit references (names and aliases)
    state.entities.forEach((entity, name) => {
      const candidates = [name, ...(entity.aliases || [])];
      candidates.forEach((candidate) => {
        // Escape special regex chars
        const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "u");
        if (regex.test(contextText)) {
          entitiesInContext.add(name);
        }
      });
    });

    // Update the visual state of each card and pill
    state.entities.forEach((entity, name) => {
      const inContext = entitiesInContext.has(name);

      // Update card
      const card = document.querySelector(
        `.entity-card[data-entity-name="${name}"]`,
      );
      if (card) {
        if (inContext) {
          card.classList.add("active");
          if (entity.color) {
            card.style.borderColor = entity.color;
            card.style.boxShadow = `0 0 8px ${entity.color}40`;
          }
        } else {
          card.classList.remove("active");
          card.style.borderColor = "";
          card.style.boxShadow = "";
        }
      }

      // Update pills in preview
      const pills = document.querySelectorAll(
        `.entity-pill[data-entity-name="${name}"]`,
      );
      pills.forEach((pill) => {
        if (entity.color) {
          pill.style.backgroundColor = `${entity.color}20`; // Light background
          pill.style.borderColor = entity.color;
          pill.style.color = "var(--color-text)"; // Keep text readable
        }
        if (inContext) {
          pill.classList.add("active");
          if (entity.color) {
            pill.style.backgroundColor = `${entity.color}40`; // Slightly darker when active
          }
        } else {
          pill.classList.remove("active");
        }
      });

      // Handle contextual expansion state
      if (
        inContext &&
        !entity.manuallyExpanded &&
        !entity.contextuallyExpanded
      ) {
        // Just entered context, mark as contextually expanded
        entity.contextuallyExpanded = true;
      } else if (
        !inContext &&
        entity.contextuallyExpanded &&
        !entity.manuallyExpanded
      ) {
        // Left context and was only contextually expanded, collapse it
        entity.contextuallyExpanded = false;
      }

      const cardElement = document.querySelector(
        `.entity-card[data-entity-name="${name}"]`,
      );

      const shouldBeExpanded = entity.manuallyExpanded || inContext;

      if (cardElement) {
        if (shouldBeExpanded) {
          cardElement.classList.remove("collapsed");
        } else {
          cardElement.classList.add("collapsed");
        }
      } else if (entity.hierarchyLevel === 3) {
        // Handle minor entities (pills)
        const pillElement = document.querySelector(
          `.entity-pill[data-entity-name="${name}"]`,
        );

        if (pillElement && shouldBeExpanded) {
          // Need to show as expanded card - force re-render
          renderEntities();
          return; // Exit early since we're re-rendering
        } else if (
          !pillElement &&
          !shouldBeExpanded &&
          entity.contextuallyExpanded
        ) {
          // Was expanded contextually but should collapse back to pill
          entity.contextuallyExpanded = false;
          renderEntities();
          return; // Exit early since we're re-rendering
        }
      }
    });
  }

  // --- View / UI Logic ---

  /* formatModifierName removed — use formatPropertyName(name) instead.
     formatPropertyName is defined earlier in this file and provides the same behaviour:
       function formatPropertyName(name) {
         if (!name) return "";
         return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
       }
  */

  /**
   * Scrolls the editor to a specific character position.
   * @param {number} position The character position to scroll to.
   */
  function scrollToPosition(position) {
    editor.focus();

    // Create a temporary div with identical styling to measure real text height
    const measureDiv = document.createElement("div");
    const computedStyle = window.getComputedStyle(editor);

    // Copy all relevant styles from textarea
    measureDiv.style.position = "absolute";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.top = "-9999px";
    measureDiv.style.left = "-9999px";
    measureDiv.style.width = computedStyle.width;
    measureDiv.style.height = "auto";
    measureDiv.style.padding = computedStyle.padding;
    measureDiv.style.border = computedStyle.border;
    measureDiv.style.boxSizing = computedStyle.boxSizing;
    measureDiv.style.font = computedStyle.font;
    measureDiv.style.fontFamily = computedStyle.fontFamily;
    measureDiv.style.fontSize = computedStyle.fontSize;
    measureDiv.style.fontWeight = computedStyle.fontWeight;
    measureDiv.style.lineHeight = computedStyle.lineHeight;
    measureDiv.style.letterSpacing = computedStyle.letterSpacing;
    measureDiv.style.wordSpacing = computedStyle.wordSpacing;
    measureDiv.style.textTransform = computedStyle.textTransform;
    measureDiv.style.whiteSpace = "pre-wrap";
    measureDiv.style.wordWrap = "break-word";
    measureDiv.style.overflowWrap = "break-word";

    document.body.appendChild(measureDiv);

    try {
      // Get text up to target position
      const textBeforePosition = editor.value.substring(0, position);

      // Set the text in our measuring div
      measureDiv.textContent = textBeforePosition;

      // Measure the height - this gives us the real visual position
      const targetHeight = measureDiv.offsetHeight;

      // Calculate context offset
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const contextLines = 4;
      const contextOffset = contextLines * lineHeight;

      // Calculate target scroll position with context
      const targetScrollTop = Math.max(0, targetHeight - contextOffset);

      // Apply scroll
      editor.scrollTop = targetScrollTop;

      // Position cursor
      editor.selectionStart = position;
      editor.selectionEnd = position;
    } finally {
      // Clean up
      document.body.removeChild(measureDiv);
    }
  }

  function renderEntities() {
    // Save current expansion state before clearing
    const expansionState = new Map();
    document.querySelectorAll(".entity-card").forEach((card) => {
      const entityName = card.dataset.entityName;
      const isExpanded = !card.classList.contains("collapsed");
      expansionState.set(entityName, isExpanded);
    });

    characterEntitiesContainer.innerHTML = "";
    const otherEntitiesDiv = document.getElementById("other-entities");
    otherEntitiesDiv.innerHTML = "";

    // Helper function to create entity card
    function createEntityCard(entity) {
      const card = document.createElement("div");
      card.className = "entity-card collapsed";
      card.dataset.entityName = entity.name;

      // Add hierarchy class
      const hierarchyClass =
        entity.hierarchyLevel === 1
          ? "hierarchy-main"
          : entity.hierarchyLevel === 2
            ? "hierarchy-secondary"
            : "hierarchy-minor";
      card.classList.add(hierarchyClass);

      // Card Header
      const header = document.createElement("div");
      header.className = "entity-card-header";
      header.innerHTML = `<span>${entity.name}</span>`;
      if (entity.color) {
        header.style.borderLeft = `4px solid ${entity.color}`;
      }
      header.addEventListener("click", () => {
        entity.manuallyExpanded = !entity.manuallyExpanded;
        // Clear contextual expansion when user manually controls
        entity.contextuallyExpanded = false;
        // For minor entities, force re-render to return to pill state
        if (entity.hierarchyLevel === 3) {
          renderEntities();
        } else {
          handleEditorSelectionChange();
        }
      });
      card.appendChild(header);

      // Card Body
      const body = document.createElement("div");
      body.className = "entity-card-body";

      // Aliases Section
      if (entity.aliases && entity.aliases.length > 0) {
        const aliasesDiv = document.createElement("div");
        aliasesDiv.className = "entity-aliases";
        aliasesDiv.innerHTML = `<strong>Aliases:</strong> ${entity.aliases.join(", ")}`;
        aliasesDiv.style.marginBottom = "0.5rem";
        aliasesDiv.style.fontSize = "0.9em";
        aliasesDiv.style.color = "var(--color-secondary)";
        body.appendChild(aliasesDiv);
      }

      const typeModifiers = ["Character", "Place", "Event", "Object"];

      // Global Info Section
      const globalInfoItems = [...entity.globalInfo.entries()].filter(
        ([key]) => !typeModifiers.includes(key),
      );

      if (globalInfoItems.length > 0) {
        const title = document.createElement("h5");
        title.textContent = "Global Info";
        body.appendChild(title);
        const ul = document.createElement("ul");
        globalInfoItems.forEach(([key, { occurrences }]) => {
          const formattedKey = formatPropertyName(key);

          if (occurrences.length === 1) {
            // Single occurrence - display normally
            const li = document.createElement("li");
            const occurrence = occurrences[0];
            li.innerHTML =
              occurrence.value === null
                ? `<strong>${formattedKey}</strong>`
                : `<strong>${formattedKey}:</strong> ${occurrence.value}`;
            li.addEventListener("click", () =>
              scrollToPosition(occurrence.position),
            );
            ul.appendChild(li);
          } else {
            // Multiple occurrences - display as expandable list
            const mainLi = document.createElement("li");
            mainLi.innerHTML = `<strong>${formattedKey}:</strong>`;
            mainLi.style.fontWeight = "bold";
            ul.appendChild(mainLi);

            const subUl = document.createElement("ul");
            subUl.style.marginLeft = "1rem";
            subUl.style.marginTop = "0.2rem";

            occurrences.forEach((occurrence, index) => {
              const subLi = document.createElement("li");
              subLi.innerHTML = occurrence.value || `(occurrence ${index + 1})`;
              subLi.addEventListener("click", () =>
                scrollToPosition(occurrence.position),
              );
              subLi.style.cursor = "pointer";
              subLi.style.fontSize = "0.9em";
              subUl.appendChild(subLi);
            });

            ul.appendChild(subUl);
          }
        });
        body.appendChild(ul);
      }

      // Relations Section (parents / children)
      if (
        (entity.parents && entity.parents.length > 0) ||
        (entity.children && entity.children.length > 0)
      ) {
        const title = document.createElement("h5");
        title.textContent = "Relations";
        body.appendChild(title);
        const ul = document.createElement("ul");

        if (entity.parents && entity.parents.length > 0) {
          const parentsLi = document.createElement("li");
          parentsLi.innerHTML = `<strong>Parents:</strong>`;
          const pUl = document.createElement("ul");
          pUl.style.marginLeft = "1rem";
          entity.parents.forEach((p) => {
            const pItem = document.createElement("li");
            pItem.textContent = p.name;
            pItem.style.cursor = "pointer";
            pItem.title = `Go to declaration of ${p.name}`;
            pItem.addEventListener("click", () => {
              // Prefer the position stored with the relation; otherwise, use the first occurrence of the parent
              const targetEntity = state.entities.get(p.name);
              const pos =
                p.position ||
                (targetEntity &&
                  targetEntity.occurrences[0] &&
                  targetEntity.occurrences[0].position) ||
                0;
              scrollToPosition(pos);
            });
            pUl.appendChild(pItem);
          });
          parentsLi.appendChild(pUl);
          ul.appendChild(parentsLi);
        }

        if (entity.children && entity.children.length > 0) {
          const childrenLi = document.createElement("li");
          childrenLi.innerHTML = `<strong>Children:</strong>`;
          const cUl = document.createElement("ul");
          cUl.style.marginLeft = "1rem";
          entity.children.forEach((c) => {
            const cItem = document.createElement("li");
            cItem.textContent = c.name;
            cItem.style.cursor = "pointer";
            cItem.title = `Go to declaration of ${c.name}`;
            cItem.addEventListener("click", () => {
              const targetEntity = state.entities.get(c.name);
              const pos =
                c.position ||
                (targetEntity &&
                  targetEntity.occurrences[0] &&
                  targetEntity.occurrences[0].position) ||
                0;
              scrollToPosition(pos);
            });
            cUl.appendChild(cItem);
          });
          childrenLi.appendChild(cUl);
          ul.appendChild(childrenLi);
        }

        body.appendChild(ul);
      }

      // Occurrences Section - Group by line number
      if (entity.occurrences.length > 0) {
        const title = document.createElement("h5");
        title.textContent = "Occurrences";
        body.appendChild(title);
        const ul = document.createElement("ul");

        // Group occurrences by line number
        const occurrencesByLine = new Map();
        entity.occurrences.forEach((occurrence) => {
          const textUpToPosition = state.rawText.substring(
            0,
            occurrence.position,
          );
          const lineNumber = textUpToPosition.split("\n").length;

          if (!occurrencesByLine.has(lineNumber)) {
            occurrencesByLine.set(lineNumber, {
              lineNumber,
              position: occurrence.position,
              localInfo: [],
              context: null,
            });
          }

          const lineGroup = occurrencesByLine.get(lineNumber);
          lineGroup.localInfo.push(...occurrence.localInfo);

          if (!lineGroup.context) {
            const closestTitle = state.documentOutline
              .filter((title) => title.position <= occurrence.position)
              .pop();
            lineGroup.context = closestTitle ? closestTitle.text : "Start";
          }
        });

        // Render grouped occurrences
        occurrencesByLine.forEach((lineGroup) => {
          const li = document.createElement("li");

          const uniqueModifiers = new Map();
          lineGroup.localInfo.forEach((info) => {
            const key = info.name;
            if (!uniqueModifiers.has(key) || info.value !== null) {
              uniqueModifiers.set(key, info.value);
            }
          });

          const localInfoHTML = Array.from(uniqueModifiers.entries())
            .map(([key, value]) => {
              if (key === "Dialog") {
                return `<span title="Dialog">💬 "${value}"</span>`;
              }
              const formattedKey = formatPropertyName(key);
              return value === null
                ? `<strong>${formattedKey}:</strong>`
                : `<strong>${formattedKey}:</strong> ${value}`;
            })
            .join(", ");

          li.innerHTML =
            `<em>${lineGroup.context} : ${lineGroup.lineNumber}</em> ${localInfoHTML}`.trim();

          li.addEventListener("click", () =>
            scrollToPosition(lineGroup.position),
          );
          ul.appendChild(li);
        });
        body.appendChild(ul);
      }

      card.appendChild(body);

      // Restore expansion state if it was preserved
      if (
        typeof expansionState !== "undefined" &&
        expansionState.has(entity.name)
      ) {
        const wasExpanded = expansionState.get(entity.name);
        if (wasExpanded) {
          card.classList.remove("collapsed");
        }
      }

      return card;
    }

    // Helper function to create entity pill
    function createEntityPill(entity) {
      const pill = document.createElement("span");
      pill.className = "entity-pill";
      pill.textContent = entity.name;
      pill.dataset.entityName = entity.name;

      if (entity.color) {
        pill.style.backgroundColor = `${entity.color}20`;
        pill.style.borderColor = entity.color;
      }

      if (entity.manuallyExpanded) {
        pill.classList.add("expanded");
      }

      pill.addEventListener("click", () => {
        entity.manuallyExpanded = !entity.manuallyExpanded;
        // Clear contextual expansion when user manually controls
        entity.contextuallyExpanded = false;
        renderEntities(); // Force complete re-render to show expanded card
      });

      return pill;
    }

    // Sort entities by hierarchy (main first), then by name
    const sortedEntities = [...state.entities.values()].sort((a, b) => {
      if (a.hierarchyLevel !== b.hierarchyLevel) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      return a.name.localeCompare(b.name);
    });

    // Separate entities by type and hierarchy
    const characterEntities = {
      main: [],
      secondary: [],
      minor: [],
    };
    const otherEntities = {
      main: [],
      secondary: [],
      minor: [],
    };

    sortedEntities.forEach((entity) => {
      if (entity.type === "temporal") {
        return; // Skip temporal entities, they're shown in timeline
      }

      const hierarchyKey =
        entity.hierarchyLevel === 1
          ? "main"
          : entity.hierarchyLevel === 2
            ? "secondary"
            : "minor";

      // Only treat entities as characters if explicitly marked
      if (entity.type === "character") {
        characterEntities[hierarchyKey].push(entity);
      } else {
        otherEntities[hierarchyKey].push(entity);
      }
    });

    // Render character entities
    [...characterEntities.main, ...characterEntities.secondary].forEach(
      (entity) => {
        characterEntitiesContainer.appendChild(createEntityCard(entity));
      },
    );

    // Handle minor character entities - keep them in their own section
    if (characterEntities.minor.length > 0) {
      const pillsSection = document.createElement("div");
      pillsSection.className = "minor-entities-pills";

      // Create containers for expanded cards and pills
      const expandedCardsContainer = document.createElement("div");
      expandedCardsContainer.className = "expanded-cards-container";

      const pillsContainer = document.createElement("div");
      pillsContainer.className = "pills-container";

      characterEntities.minor.forEach((entity) => {
        if (entity.manuallyExpanded || entity.contextuallyExpanded) {
          // Create expanded card but keep it in the minor section
          const expandedCard = createEntityCard(entity);
          expandedCard.classList.remove("collapsed"); // Start expanded
          expandedCardsContainer.appendChild(expandedCard);
        } else {
          // Create pill
          pillsContainer.appendChild(createEntityPill(entity));
        }
      });

      // Add both containers to the section
      if (expandedCardsContainer.children.length > 0) {
        pillsSection.appendChild(expandedCardsContainer);
      }
      if (pillsContainer.children.length > 0) {
        pillsSection.appendChild(pillsContainer);
      }
      characterEntitiesContainer.appendChild(pillsSection);
    }

    // Render other entities grouped by type and hierarchy
    const otherEntitiesByType = new Map();

    // Group all non-temporal, non-character entities by type
    sortedEntities.forEach((entity) => {
      if (entity.type === "temporal" || entity.type === "character") {
        return; // Skip temporal and character entities
      }

      const typeKey = entity.type || "other";
      if (!otherEntitiesByType.has(typeKey)) {
        otherEntitiesByType.set(typeKey, {
          main: [],
          secondary: [],
          minor: [],
        });
      }

      const hierarchyKey =
        entity.hierarchyLevel === 1
          ? "main"
          : entity.hierarchyLevel === 2
            ? "secondary"
            : "minor";
      otherEntitiesByType.get(typeKey)[hierarchyKey].push(entity);
    });

    // Render each type group with hierarchy ordering
    const typeNames = {
      place: "Places",
      event: "Events",
      object: "Objects",

      other: "Other Entities",
    };

    otherEntitiesByType.forEach((hierarchies, type) => {
      // Create type section
      const typeSection = document.createElement("div");
      typeSection.className = "entity-type-section";

      const typeTitle = document.createElement("h3");
      // Capitalize first letter for display
      const displayName =
        typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
      typeTitle.textContent = displayName;
      typeTitle.className = "entity-type-title";
      typeSection.appendChild(typeTitle);

      // Add main and secondary entities as full cards
      [...hierarchies.main, ...hierarchies.secondary].forEach((entity) => {
        typeSection.appendChild(createEntityCard(entity));
      });

      // Handle minor entities for this type
      if (hierarchies.minor.length > 0) {
        const minorSection = document.createElement("div");
        minorSection.className = "minor-entities-pills";

        // Create containers for expanded cards and pills
        const expandedCardsContainer = document.createElement("div");
        expandedCardsContainer.className = "expanded-cards-container";

        const pillsContainer = document.createElement("div");
        pillsContainer.className = "pills-container";

        hierarchies.minor.forEach((entity) => {
          if (entity.manuallyExpanded || entity.contextuallyExpanded) {
            const expandedCard = createEntityCard(entity);
            expandedCard.classList.remove("collapsed");
            expandedCardsContainer.appendChild(expandedCard);
          } else {
            pillsContainer.appendChild(createEntityPill(entity));
          }
        });

        // Add containers to minor section
        if (expandedCardsContainer.children.length > 0) {
          minorSection.appendChild(expandedCardsContainer);
        }
        if (pillsContainer.children.length > 0) {
          minorSection.appendChild(pillsContainer);
        }

        typeSection.appendChild(minorSection);
      }

      otherEntitiesDiv.appendChild(typeSection);
    });
  }

  function renderDocumentOutline() {
    const container = document.getElementById("document-outline-area");
    container.innerHTML = "";

    if (!state.documentOutline || state.documentOutline.length === 0) {
      return;
    }

    const title = document.createElement("h5");
    title.className = "panel-title";
    title.textContent = "Document Outline";
    container.appendChild(title);

    const list = document.createElement("ul");
    list.className = "document-outline-list";

    state.documentOutline.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = `outline-level-${item.level}`;
      listItem.textContent = item.text;
      listItem.title = `Go to "${item.text}"`;
      listItem.style.paddingLeft = `${(item.level - 1) * 1}rem`;

      listItem.addEventListener("click", () => {
        editor.focus();
        editor.selectionStart = item.position;
        editor.selectionEnd = item.position;

        // Scroll the editor to bring the clicked item to the top.
        const textUpToPosition = editor.value.substring(0, item.position);
        const lineNumber = textUpToPosition.split("\n").length;
        const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
        editor.scrollTop = (lineNumber - 1) * lineHeight;
      });

      list.appendChild(listItem);
    });

    container.appendChild(list);
  }

  function renderHierarchy() {
    const container = document.getElementById("hierarchy-area");
    if (!container) return;
    container.innerHTML = "";

    // Nothing to render when no entities
    if (!state.entities || state.entities.size === 0) {
      return;
    }

    // Build set of entities involved in hierarchical relations (have parents or children)
    const involved = new Set();
    state.entities.forEach((entity, name) => {
      const hasParent = entity.parents && entity.parents.length > 0;
      const hasChildren = entity.children && entity.children.length > 0;
      if (hasParent || hasChildren) {
        involved.add(name);
        if (hasParent) {
          entity.parents.forEach((p) => {
            if (p && p.name) involved.add(p.name);
          });
        }
        if (hasChildren) {
          entity.children.forEach((c) => {
            if (c && c.name) involved.add(c.name);
          });
        }
      }
    });

    // If no entity participates in a hierarchy, leave the block empty
    if (involved.size === 0) {
      return;
    }

    // Find root entities among the involved set: those that do not have a parent inside the involved set
    const roots = [];
    involved.forEach((name) => {
      const ent = state.entities.get(name);
      const parents = ent && ent.parents ? ent.parents.map((p) => p.name) : [];
      const hasParentInvolved = parents.some((pn) => involved.has(pn));
      if (!hasParentInvolved) roots.push(name);
    });

    // If there are no roots (e.g. cycles), leave the block empty per instructions
    if (roots.length === 0) {
      return;
    }

    // Title (styled like Document Outline)
    const title = document.createElement("h5");
    title.className = "panel-title";
    title.textContent = "Hierarchy";
    container.appendChild(title);

    // Helper to create a details/summary subtree for an entity, limited to 'involved' members
    function createNode(name, visited = new Set(), parentName = null) {
      const ent = state.entities.get(name);
      const details = document.createElement("details");
      const summary = document.createElement("summary");

      // Build a custom summary with an inline SVG chevron (so visuals are consistent across browsers)
      summary.className = "hierarchy-summary";
      summary.style.cursor = "pointer";

      // Chevron span (SVG)
      const chevron = document.createElement("span");
      chevron.className = "hierarchy-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.style.display = "inline-block";
      chevron.style.width = "1em";
      chevron.style.height = "1em";
      chevron.style.verticalAlign = "middle";
      chevron.style.transition = "transform 0.18s ease";
      chevron.style.marginRight = "0.35rem";
      chevron.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
          <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
        </svg>
      `;

      const nameSpan = document.createElement("span");
      nameSpan.className = "hierarchy-name";
      nameSpan.textContent = name;
      if (ent && ent.color) {
        nameSpan.style.color = ent.color;
      }

      // Append chevron and name into summary
      summary.appendChild(chevron);
      summary.appendChild(nameSpan);
      details.appendChild(summary);

      // Prevent cycles
      if (visited.has(name)) {
        const note = document.createElement("div");
        note.textContent = "(cycle)";
        note.style.fontSize = "0.9em";
        note.style.color = "var(--color-secondary)";
        details.appendChild(note);

        // Dim the chevron for cycle nodes
        chevron.style.opacity = "0.4";
        return details;
      }

      // Mark visited for this branch
      const nextVisited = new Set(visited);
      nextVisited.add(name);

      // Determine children that are part of the involved set
      const children =
        ent && ent.children
          ? ent.children.map((c) => c.name).filter((n) => involved.has(n))
          : [];

      // If entity has involved children, render them as nested details inside a list
      if (children.length > 0) {
        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.paddingLeft = "0.8rem";
        children.forEach((cname) => {
          const li = document.createElement("li");
          // Pass current entity name as the parentName so child nodes can resolve relation positions
          const childNode = createNode(cname, nextVisited, name);
          li.appendChild(childNode);
          ul.appendChild(li);
        });
        details.appendChild(ul);
      }

      // Keep chevron rotation in sync with details open state
      details.addEventListener("toggle", () => {
        if (details.open) {
          chevron.style.transform = "rotate(90deg)";
        } else {
          chevron.style.transform = "rotate(0deg)";
        }
      });

      // Initialize chevron state in case details is programmatically opened
      if (details.open) {
        chevron.style.transform = "rotate(90deg)";
      }

      // Clicking the summary should scroll to the position where the relation to the parent was declared,
      // or to the earliest relation declaration involving this entity when no explicit parent is available,
      // falling back to the entity's first occurrence if no relation positions are known.
      summary.addEventListener("click", (ev) => {
        // Allow the native toggle behavior to proceed (do not preventDefault),
        // but still compute and jump to the relation position.
        let pos = null;

        // If rendered as a child of another node, prefer the relation position between this entity and that parent
        if (parentName && ent) {
          // Prefer explicit parent link to parentName (where this entity appears as child)
          if (ent.parents && ent.parents.length > 0) {
            const rel = ent.parents.find(
              (p) => p.name === parentName && p.position,
            );
            if (rel) pos = rel.position;
          }
          // If not found, check whether this entity is recorded as parent for parentName (edge cases)
          if (pos === null && ent.children && ent.children.length > 0) {
            const rel2 = ent.children.find(
              (c) => c.name === parentName && c.position,
            );
            if (rel2) pos = rel2.position;
          }
        } else if (ent) {
          // No parentName: compute the earliest relation declaration position involving this entity.
          const relPositions = [];
          if (ent.parents && ent.parents.length > 0) {
            ent.parents.forEach((p) => {
              if (p && p.position !== undefined && p.position !== null)
                relPositions.push(p.position);
            });
          }
          if (ent.children && ent.children.length > 0) {
            ent.children.forEach((c) => {
              if (c && c.position !== undefined && c.position !== null)
                relPositions.push(c.position);
            });
          }
          if (relPositions.length > 0) {
            pos = Math.min(...relPositions);
          }
        }

        // Fallback -> first declaration/occurrence of the entity
        if (pos === null || pos === 0) {
          if (ent && ent.occurrences && ent.occurrences[0]) {
            pos = ent.occurrences[0].position;
          } else {
            pos = 0;
          }
        }

        // Slight delay to let native toggle take effect visually before jumping
        setTimeout(() => {
          scrollToPosition(pos);
        }, 10);
      });

      return details;
    }

    // Sort roots alphabetically and append their trees
    roots.sort((a, b) => a.localeCompare(b));
    roots.forEach((r) => {
      const node = createNode(r);
      container.appendChild(node);
    });
  }

  function renderTimeline() {
    const timelineAxis = document.getElementById("timeline-axis");
    timelineAxis.innerHTML = "";

    // Filter temporal entities with valid parsed dates
    const temporalEntities = Array.from(state.entities.values()).filter(
      (entity) => entity.type === "temporal" && entity.parsedAbsoluteDate,
    );

    if (temporalEntities.length === 0) {
      return;
    }

    // Sort entities by date
    temporalEntities.sort(
      (a, b) => a.parsedAbsoluteDate.getTime() - b.parsedAbsoluteDate.getTime(),
    );

    // Calculate timeline bounds
    const minDate = temporalEntities[0].parsedAbsoluteDate.getTime();
    const maxDate =
      temporalEntities[
        temporalEntities.length - 1
      ].parsedAbsoluteDate.getTime();
    const timeRange = maxDate - minDate;

    // Create markers for each temporal entity
    temporalEntities.forEach((entity) => {
      const marker = document.createElement("div");
      marker.className = "timeline-marker";
      marker.dataset.entityName = entity.name;

      // Calculate position (0% to 100%)
      let position = 0;
      if (timeRange > 0) {
        position =
          ((entity.parsedAbsoluteDate.getTime() - minDate) / timeRange) * 100;
      }
      marker.style.left = `${position}%`;

      // Create label
      const label = document.createElement("div");

      // Apply different rotation for labels at extremities to prevent overflow
      if (position <= 10) {
        label.className = "timeline-label timeline-label-left";
      } else if (position >= 90) {
        label.className = "timeline-label timeline-label-right";
      } else {
        label.className = "timeline-label";
      }

      label.textContent = entity.name;

      marker.appendChild(label);
      timelineAxis.appendChild(marker);

      // Add click handler
      marker.addEventListener("click", () => {
        // If entity has multiple occurrences, show selection popup
        if (entity.occurrences.length > 1) {
          showOccurrenceSelector(entity, marker);
        } else if (entity.occurrences.length === 1) {
          scrollToPosition(entity.occurrences[0].position);
        }
      });
    });
  }

  function showOccurrenceSelector(entity, marker) {
    // Remove any existing selector
    const existingSelector = document.querySelector(".occurrence-selector");
    if (existingSelector) {
      existingSelector.remove();
    }

    // Create occurrence selector popup
    const selector = document.createElement("div");
    selector.className = "occurrence-selector";
    selector.style.position = "absolute";
    selector.style.bottom = "70px";
    selector.style.left = marker.style.left;
    selector.style.transform = "translateX(-50%)";
    selector.style.backgroundColor = "var(--color-surface)";
    selector.style.border = "1px solid var(--border-color)";
    selector.style.borderRadius = "4px";
    selector.style.padding = "0.5rem";
    selector.style.zIndex = "1000";
    selector.style.minWidth = "200px";

    const title = document.createElement("div");
    title.textContent = `${entity.name} - Choisir l'occurrence :`;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "0.5rem";
    title.style.color = "var(--color-secondary)";
    selector.appendChild(title);

    entity.occurrences.forEach((occurrence, index) => {
      const option = document.createElement("div");
      option.style.padding = "0.3rem";
      option.style.cursor = "pointer";
      option.style.borderRadius = "3px";
      option.style.transition = "background-color 0.2s";

      // Find context from section title
      const closestTitle = state.documentOutline
        .filter((title) => title.position <= occurrence.position)
        .pop();
      const context = closestTitle ? closestTitle.text : "Début";

      // Find line number
      const textUpToPosition = state.rawText.substring(0, occurrence.position);
      const lineNumber = textUpToPosition.split("\n").length;

      option.textContent = `${context} : ${lineNumber}`;

      option.addEventListener("mouseenter", () => {
        option.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      });

      option.addEventListener("mouseleave", () => {
        option.style.backgroundColor = "transparent";
      });

      option.addEventListener("click", () => {
        scrollToPosition(occurrence.position);
        selector.remove();
      });

      selector.appendChild(option);
    });

    // Add close button
    const closeButton = document.createElement("div");
    closeButton.textContent = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0.2rem";
    closeButton.style.right = "0.5rem";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "var(--color-secondary)";
    closeButton.style.fontSize = "1.2rem";
    closeButton.addEventListener("click", () => {
      selector.remove();
    });
    selector.appendChild(closeButton);

    document.getElementById("timeline-axis").appendChild(selector);

    // Close selector when clicking outside
    setTimeout(() => {
      document.addEventListener("click", function closeSelector(e) {
        if (!selector.contains(e.target) && !marker.contains(e.target)) {
          selector.remove();
          document.removeEventListener("click", closeSelector);
        }
      });
    }, 0);
  }

  function setupEventListeners() {
    editor.addEventListener("input", processEditorChange);
    viewMdBtn.addEventListener("click", () => switchViewMode("md"));
    viewHtmlBtn.addEventListener("click", () => switchViewMode("html"));

    // Handle cursor position changes
    editor.addEventListener("keyup", handleEditorSelectionChange);
    editor.addEventListener("click", handleEditorSelectionChange);
    editor.addEventListener("focus", handleEditorSelectionChange);
  }

  function switchViewMode(mode) {
    if (state.viewMode === mode) return; // Do nothing if already in this mode
    state.viewMode = mode;
    viewMdBtn.classList.toggle("active", mode === "md");
    viewHtmlBtn.classList.toggle("active", mode === "html");
    updatePreview();

    // Toggle white-space class for preview-output
    const previewOutput = document.getElementById("preview-output");
    if (previewOutput) {
      if (mode === "md") {
        previewOutput.classList.add("markdown-view");
        previewOutput.classList.remove("html-view");
      } else if (mode === "html") {
        previewOutput.classList.add("html-view");
        previewOutput.classList.remove("markdown-view");
      }
    }
  }

  function setupResizer() {
    const resizer = document.getElementById("resizer");
    const container = document.getElementById("central-column");
    const topPane = document.getElementById("editor-area");
    const bottomPane = document.getElementById("preview-area");

    const mouseDownHandler = function (e) {
      e.preventDefault();

      // Add styles to the body to improve UX during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";

      const mouseMoveHandler = function (moveEvent) {
        const containerRect = container.getBoundingClientRect();
        const resizerHeight = resizer.offsetHeight;

        // Calculate the height of the top pane based on the mouse's position
        let topHeight = moveEvent.clientY - containerRect.top;

        // Total height available for the two panes
        const totalPaneHeight = containerRect.height - resizerHeight;

        // Add constraints to prevent panes from becoming too small
        const minHeight = 80; // Corresponds roughly to 5rem
        if (topHeight < minHeight) {
          topHeight = minHeight;
        }
        if (topHeight > totalPaneHeight - minHeight) {
          topHeight = totalPaneHeight - minHeight;
        }

        const bottomHeight = totalPaneHeight - topHeight;

        // Set flex-basis for both panes to ensure consistent behavior
        topPane.style.flexBasis = `${topHeight}px`;
        bottomPane.style.flexBasis = `${bottomHeight}px`;
      };

      const mouseUpHandler = function () {
        // Clean up event listeners and styles
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document.body.style.userSelect = "auto";
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    resizer.addEventListener("mousedown", mouseDownHandler);
  }

  function setupHorizontalResizers() {
    const leftResizer = document.getElementById("resizer-left");
    const rightResizer = document.getElementById("resizer-right");
    const mainContainer = document.querySelector(".main-container");
    const centralColumn = document.getElementById("central-column");

    const mouseDownHandler = function (e, resizer) {
      e.preventDefault();

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const startX = e.clientX;
      const startWidth = centralColumn.offsetWidth;
      const multiplier = resizer.id === "resizer-right" ? 1 : -1;

      const mouseMoveHandler = function (moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        let newWidth = startWidth + 2 * deltaX * multiplier;

        // Add constraints
        const minWidth = 300; // Minimum width of 300px
        if (newWidth < minWidth) {
          newWidth = minWidth;
        }

        // Update grid layout directly
        mainContainer.style.gridTemplateColumns = `1fr 10px ${newWidth}px 10px 1fr`;

        // Save to localStorage
        saveToLocalStorage();
      };

      const mouseUpHandler = function () {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document.body.style.userSelect = "auto";
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    leftResizer.addEventListener("mousedown", (e) =>
      mouseDownHandler(e, leftResizer),
    );
    rightResizer.addEventListener("mousedown", (e) =>
      mouseDownHandler(e, rightResizer),
    );
  }

  function setupScrollSync() {
    const editorPane = document.getElementById("musetag-editor");
    const previewPane = document.getElementById("preview-output");
    let activeScroller = null;
    let scrollTimeout;

    const onScroll = (scrolledElement, targetElement) => {
      // If a scroll event is programmatically triggered on the non-active pane, ignore it.
      if (activeScroller !== null && activeScroller !== scrolledElement) {
        return;
      }

      // Set the current scroller as the active one.
      activeScroller = scrolledElement;

      const sourceScrollHeight =
        scrolledElement.scrollHeight - scrolledElement.clientHeight;
      // Avoid division by zero and unnecessary calculations.
      if (sourceScrollHeight <= 0) {
        return;
      }

      const scrollRatio = scrolledElement.scrollTop / sourceScrollHeight;
      const targetScrollHeight =
        targetElement.scrollHeight - targetElement.clientHeight;

      targetElement.scrollTop = scrollRatio * targetScrollHeight;

      // After a short delay, reset the active scroller.
      // This allows the user to switch which pane they are scrolling.
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        activeScroller = null;
      }, 150);
    };

    editorPane.addEventListener("scroll", () =>
      onScroll(editorPane, previewPane),
    );
    previewPane.addEventListener("scroll", () =>
      onScroll(previewPane, editorPane),
    );
  }

  // --- Persistence ---

  function saveToLocalStorage() {
    try {
      const centralColumn = document.getElementById("central-column");
      const columnWidth = centralColumn.offsetWidth;

      const dataToSave = {
        text: state.rawText,
        columnWidth: columnWidth,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        // Try to parse as JSON first (new format)
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.text) {
            editor.value = parsedData.text;
          }
          if (parsedData.columnWidth) {
            // Restore column width
            const mainContainer = document.querySelector(".main-container");
            mainContainer.style.gridTemplateColumns = `1fr 10px ${parsedData.columnWidth}px 10px 1fr`;
          }
        } catch (parseError) {
          // Fallback to old format (plain text)
          editor.value = savedData;
        }
      } else {
        // No saved data - load default demo text
        editor.value = getDefaultDemoText();
      }
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      // If localStorage fails, still show demo text
      editor.value = getDefaultDemoText();
    }
  }

  function getDefaultDemoText() {
    return `# The Gift of the Magi
*A MuseTag Demo - based on O. Henry's classic story*

> **Welcome to the MuseTag Demo!**
>
> - **Left panel:** Character entities detected in your text.
> - **Bottom:** Timeline of events and dates.
> - **Right (top):** Table of contents (TOC) for quick navigation.
> - **Right (bottom):** Other entities, grouped by type.
> - **Center:** Edit your text here. As you type, MuseTag annotations are detected and highlighted.
> - **Below the editor:** Preview your text as Markdown or as clean HTML (reader view).
>
> **Tips:**
> - Click on an TOC entry, on date in the timeline or on an entity appereance entry in its card to jump to its position in the text.
> - Move your cursor in the editor: the panels update to show relevant info for the current context.
> - Try editing or adding MuseTag annotations to see how the interface reacts in real time.
>
> _This demo helps you visualize how MuseTag structures and enriches your narrative as you write!_

@@.(## Christmas Eve)
@@.(### One dollar and eighty-seven cents)

@@(1905-12-24 12:00) ONE dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies.
Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one’s
heeks burned with the silent imputation of parsimony that such close dealing implied. Three times @@Della counted it.
One dollar and eighty-seven cents. And the next day would be @@Christmas.Event.

There was clearly nothing to do but flop down on the shabby little couch and howl.
So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.

While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home.
A furnished @@flat.Place.DESCRIPTION[ at $8 per week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad.]

In the vestibule below was a letter-box into which no letter would go, and an electric button from which no mortal finger could coax a ring.
Also appertaining thereunto was a card bearing the name “@@Jim.FULLNAME[Mr. James Dillingham Young].”

The “Dillingham” had been flung to the breeze during a former period of prosperity when its possessor was being paid $30 per week.
Now, when the income was shrunk to $20, the letters of “Dillingham” looked blurred,
as though they were thinking seriously of contracting to a modest and unassuming D.
But whenever Mr. James Dillingham Young came home and reached his flat above he was called “Jim” and greatly hugged by Mrs. James Dillingham Young,
already introduced to you as Della. Which is all very good.

Della finished her cry and attended to her cheeks with the powder rag.
She stood by the window and looked out dully at a grey cat walking a grey fence in a grey backyard.
To-morrow would be Christmas Day, and she had only $1.87 with which to buy Jim a present.
She had been saving every penny she could for months, with this result. Twenty dollars a week doesn’t go far.
Expenses had been greater than she had calculated. They always are. Only $1.87 to buy a present for Jim.
Her Jim. Many a happy hour she had spent planning for something nice for him.
omething fine and rare and sterling—something just a little bit near to being worthy of the honour of being owned by Jim.

There was a pier-glass between the windows of the room. Perhaps you have seen a pier-glass in an $8 flat.
A very thin and very agile person may, by observing his reflection in a rapid sequence of longitudinal strips, obtain a fairly accurate conception of his looks.
Della, being slender, had mastered the art.

Suddenly she whirled from the window and stood before the glass.
Her eyes were shining brilliantly, but her face had lost its colour within twenty seconds.
Rapidly she pulled down her @@hair.Object and let it fall to its full length.

Now, there were two possessions of the @@(Jim)James Dillingham Youngs in which they both took a mighty pride.
One was Jim’s gold @@watch.Object that had been his @@@@father’s and his @@@@grandfather’s. The other was Della’s hair.
Had @@@@the_Queen_of_Sheba lived in the flat across the airshaft,
Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty’s jewels and gifts.
Had @@@@King_Solomon been the janitor, with all his treasures piled up in the basement,
Jim would have pulled out his watch every time he passed, just to see him pluck at his beard from envy.

So now Della’s beautiful hair fell about her, rippling and shining like a cascade of brown waters.
It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly.
Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.

@@.(### Selling her hair)
@@(1905-12-24 14:00)
On went her old brown jacket; on went @@.(Della)her old brown hat.
With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.

Where she stopped the sign read: “Mme. @@@@Sofronie. Hair Goods of All Kinds.”
One flight up Della ran, and collected herself, panting.
Madame, large, too white, chilly, hardly looked the “Sofronie.”

“Will you buy my hair?” asked Della.

“I buy hair,” said @@(Sofronie)Madame. “Take yer hat off and let’s have a sight at the looks of it.”

Down rippled the brown cascade.

“Twenty dollars,” @@(Sofronie)said Madame, lifting the mass with a practised hand.

“Give it to me quick,” said Della,

Oh, and the next two hours tripped by on rosy wings. Forget the hashed metaphor. She was ransacking the stores for Jim’s present.

She found it at last. It surely had been made for Jim and no one else.
There was no other like it in any of the stores, and she had turned all of them inside out.
@@(The_Chain).Object.DESCRIPTION[It was a platinum fob chain simple and chaste in design, properly proclaiming its value by substance alone and not by meretricious ornamentation—as all good things should do.]
It was even worthy of @@(watch)The_Watch.Object. As soon as she saw it she knew that it must be Jim’s.
It was like him. Quietness and value—the description applied to both.
Twenty-one dollars they took from her for it, and she hurried home with the 87 cents.
With that chain on his watch Jim might be properly anxious about the time in any company.
Grand as the watch was, he sometimes looked at it on the sly on account of the old leather strap that he used in place of a chain.

@@.(### At home again)
@@(1905-12-24 16:00)
When Della reached home her intoxication gave way a little to prudence and reason.
She got out her curling irons and lighted the gas and went to work repairing the ravages made by generosity added to love.
Which is always a tremendous task, dear friends—a mammoth task.

@@(1905-12-24 16:40)
@@(Della) Within forty minutes her head was covered with tiny, close-lying curls that made her look wonderfully like a truant schoolboy.
She looked at her reflection in the mirror long, carefully, and critically.

@@(Della) “If Jim doesn’t kill me,” she said to herself, “before he takes a second look at me, he’ll say I look like a Coney Island chorus girl.
But what could I do—oh! what could I do with a dollar and eighty-seven cents?”

@@(1905-12-24 19:00)
At 7 o’clock the coffee was made and the frying-pan was on the back of the stove hot and ready to cook the chops.

Jim was never late. Della doubled the fob chain in her hand and sat on the corner of the table near the door that he always entered.
Then she heard his step on the stair away down on the first flight, and she turned white for just a moment.
She had a habit of saying little silent prayers about the simplest everyday things, and now she whispered: “Please God, make him think I am still pretty.”

The door opened and Jim stepped in and closed it. He looked thin and very serious.
Poor fellow, he was only twenty-two—and to be burdened with a family! He needed a new overcoat and he was without gloves.

Jim stopped inside the door, as immovable as a setter at the scent of quail.
His eyes were fixed upon Della, and there was an expression in them that she could not read, and it terrified her.
It was not anger, nor surprise, nor disapproval, nor horror, nor any of the sentiments that she had been prepared for.
He simply stared at her fixedly with that peculiar expression on his face.

Della wriggled off the table and went for him.

“Jim, darling,” @@(Della)she cried, “don’t look at me that way.
I had my hair cut off and sold it because I couldn’t have lived through Christmas without giving you a present.
It’ll grow out again—you won’t mind, will you? I just had to do it. My hair grows awfully fast.
Say ‘Merry Chistmas!’ Jim, and let’s be happy. You don’t know what a nice—what a beautiful, nice gift I’ve got for you.”

“You’ve cut off @@(Della)your hair?” asked Jim, laboriously, as if he had not arrived at that patent fact yet even after the hardest mental labour.

“Cut it off and sold it,” said Della. “Don’t @@(Jim)you like me just as well, anyhow? I’m me without my hair, ain’t I?”

Jim looked about the room curiously.

“You say your hair is gone?” he said, with an air almost of idiocy. @@(Della) @@(Jim)

“You needn’t look for it,” said Della. “It’s sold, I tell you—sold and gone, too. It’s Christmas Eve, @@(Jim)boy.
Be good to me, for it went for you.
Maybe the hairs of my head were numbered,” she went on with a sudden serious sweetness, “but nobody could ever count my love for you.
Shall I put the chops on, Jim?”

Out of his trance Jim seemed quickly to wake. He enfolded his Della.
For ten seconds let us regard with discreet scrutiny some inconsequential object in the other direction.
Eight dollars a week or a million a year—what is the difference? A mathematician or a wit would give you the wrong answer.
The magi brought valuable gifts, but that was not among them. This dark assertion will be illuminated later on.

Jim drew a package from his overcoat pocket and threw it upon the table.

“Don’t make any mistake, @@(Della)Dell,” @@(Jim)he said, “about me.
I don’t think there’s anything in the way of a haircut or a shave or a shampoo that could make me like my girl any less.
But if you’ll unwrap that package you may see why you had me going a while at first.”

White fingers and nimble tore at the string and paper.
And then an ecstatic scream of joy; and then, alas! a quick feminine change to hysterical tears and wails,
necessitating the immediate employment of all the comforting powers of the lord of the flat.

For there lay The Combs—the set of combs, side and back, that Della had worshipped for long in a @@@@Broadway.Place window.
Beautiful combs, pure tortoise shell, with jewelled rims—just the shade to wear in the beautiful vanished hair.
They were expensive combs, she knew, and her heart had simply craved and yearned over them without the least hope of possession.
And now, they were hers, but the tresses that should have adorned the coveted adornments were gone.

But @@(Della)she hugged them to her bosom, and at length she was able to look up with dim eyes and a smile and say: “My hair grows so fast, Jim!”

And then Della leaped up like a little singed cat and cried, “Oh, oh!”

Jim had not yet seen his beautiful present.
She held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit.

“Isn’t it a dandy, Jim? I hunted all over town to find it. You’ll have to look at the time a hundred times a day now.
Give me your watch. I want to see how it looks on it.”

Instead of obeying, Jim tumbled down on the couch and put his hands under the back of his head and smiled.

“Dell,” said he, “let’s put our Christmas presents away and keep ’em a while.
They’re too nice to use just at present. I sold the watch to get the money to buy your combs.
And now suppose you put the chops on.”

@@.(### Moral)
The magi, as you know, were wise men—wonderfully wise men—who brought gifts to the Babe in the manger.
They invented the art of giving Christmas presents.
Being wise, their gifts were no doubt wise ones, possibly bearing the privilege of exchange in case of duplication.
And here I have lamely related to you the uneventful chronicle of two foolish children in a flat who most unwisely sacrificed for each other the greatest treasures of their house. But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest. Of all who give and receive gifts, such as they are wisest. Everywhere they are wisest. They are the magi.

*This demo showcases MuseTag's entity tracking, character development, timeline features, and annotation capabilities.*`;
  }

  // --- Initialization ---

  function init() {
    loadFromLocalStorage();
    setupEventListeners();
    setupResizer();
    setupHorizontalResizers();
    setupScrollSync();
    processEditorChange(); // Initial processing of the loaded text
    // Ensure hierarchy is rendered on startup (processEditorChange already calls it,
    // but call again to be explicit and robust)
    if (typeof renderHierarchy === "function") {
      renderHierarchy();
    }
    console.log("MuseTag Editor initialized.");
  }

  init();
});
