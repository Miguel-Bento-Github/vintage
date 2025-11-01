'use client';

import { useEffect, useRef, useState } from 'react';
import { createDraggable, animate, spring } from 'animejs';

interface Section {
  id: string;
  label: string;
  order: number;
}

interface DraggableSectionsProps {
  sections: Array<{ id: string; label: string }>;
  onSectionClick: (sectionId: string) => void;
  isSectionComplete: (sectionId: string) => boolean;
  hasSectionChanges: (sectionId: string) => boolean;
  storageKey?: string;
  onOrderChange?: (newOrder: string[]) => void;
}

export default function DraggableSections({
  sections: initialSections,
  onSectionClick,
  isSectionComplete,
  hasSectionChanges,
  storageKey = 'adminEditPageSectionOrder',
  onOrderChange,
}: DraggableSectionsProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const containerRef = useRef<HTMLUListElement>(null);
  const itemHeightsRef = useRef<Map<string, number>>(new Map());
  const currentOrderRef = useRef<string[]>([]);

  // Load saved order from localStorage or use default
  useEffect(() => {
    const savedOrder = localStorage.getItem(storageKey);
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder) as string[];
        const orderedSections = order
          .map((id, index) => {
            const section = initialSections.find((s) => s.id === id);
            return section ? { ...section, order: index } : null;
          })
          .filter((section): section is Section => section !== null);

        // Add any new sections that weren't in saved order
        const existingIds = new Set(order);
        initialSections.forEach((section) => {
          if (!existingIds.has(section.id)) {
            orderedSections.push({ ...section, order: orderedSections.length });
          }
        });

        setSections(orderedSections);
        currentOrderRef.current = orderedSections.map(s => s.id);
      } catch {
        const defaultSections = initialSections.map((s, index) => ({ ...s, order: index }));
        setSections(defaultSections);
        currentOrderRef.current = defaultSections.map(s => s.id);
      }
    } else {
      const defaultSections = initialSections.map((s, index) => ({ ...s, order: index }));
      setSections(defaultSections);
      currentOrderRef.current = defaultSections.map(s => s.id);
    }
  }, [initialSections, storageKey]);

  // Initialize drag and drop
  useEffect(() => {
    if (!containerRef.current || sections.length === 0) return;

    const container = containerRef.current;
    const itemsList = Array.from(container.querySelectorAll('.draggable-section'));
    if (itemsList.length === 0) return;

    // Store initial heights
    itemsList.forEach((item) => {
      const id = item.getAttribute('data-id');
      if (id) {
        itemHeightsRef.current.set(id, item.getBoundingClientRect().height);
      }
    });

    let draggedId: string | null = null;
    let draggedElement: HTMLElement | null = null;
    let lastSwapIndex = -1;
    const itemPositions = new Map<string, number>(); // Track current visual positions

    // Initialize positions based on initial order
    currentOrderRef.current.forEach((id, index) => {
      itemPositions.set(id, index);
    });

    // Create individual draggable instances for each item
    const draggables = itemsList.map((item) => {
      const itemHeight = itemHeightsRef.current.get(item.getAttribute('data-id') || '') || 48;

      return createDraggable(item as HTMLElement, {
        y: true,
        x: false,
        container: container,
        trigger: item.querySelector('.drag-handle') as HTMLElement,
        snap: {
          y: itemHeight,
        },
        releaseStiffness: 150,
        releaseEase: spring({
          stiffness: 150,
          damping: 20,
        }),
        onGrab: (self) => {
          const target = self.$target;
          draggedId = target.getAttribute('data-id');
          draggedElement = target;
          lastSwapIndex = -1;

          target.style.zIndex = '1000';
          target.style.opacity = '0.7';
        },
        onDrag: (self) => {
          if (!draggedId || !draggedElement) return;

          const items = Array.from(container.querySelectorAll('.draggable-section'));
          const draggedRect = draggedElement.getBoundingClientRect();
          const draggedMiddle = draggedRect.top + draggedRect.height / 2;

          const currentDraggedIndex = currentOrderRef.current.indexOf(draggedId);
          let newIndex = currentDraggedIndex;
          const threshold = 1.5;

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item.getAttribute('data-id');
            if (!id || id === draggedId) continue;

            const rect = item.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;

            if (draggedMiddle < itemMiddle - threshold) {
              const targetIndex = currentOrderRef.current.indexOf(id);
              if (targetIndex < currentDraggedIndex) {
                newIndex = targetIndex;
                break;
              }
            } else if (draggedMiddle > itemMiddle + threshold) {
              const targetIndex = currentOrderRef.current.indexOf(id);
              if (targetIndex > currentDraggedIndex) {
                newIndex = targetIndex;
              }
            }
          }

          // Handle edge cases: above first item or below last item
          if (newIndex === currentDraggedIndex) {
            const firstItem = items.find(item => {
              const id = item.getAttribute('data-id');
              return id && id !== draggedId;
            });
            const lastItem = [...items].reverse().find(item => {
              const id = item.getAttribute('data-id');
              return id && id !== draggedId;
            });

            if (firstItem && draggedMiddle < firstItem.getBoundingClientRect().top) {
              newIndex = 0;
            } else if (lastItem && draggedMiddle > lastItem.getBoundingClientRect().bottom) {
              newIndex = currentOrderRef.current.length - 1;
            }
          }

          // Only update if position changed
          if (newIndex !== currentDraggedIndex && newIndex !== lastSwapIndex) {
            lastSwapIndex = newIndex;

            const newOrder = [...currentOrderRef.current];
            const [removed] = newOrder.splice(currentDraggedIndex, 1);
            newOrder.splice(newIndex, 0, removed);
            currentOrderRef.current = newOrder;

            items.forEach((otherItem) => {
              const itemId = otherItem.getAttribute('data-id');
              if (!itemId || itemId === draggedId) return;

              const oldVisualPosition = itemPositions.get(itemId) || 0;
              const newVisualPosition = newOrder.indexOf(itemId);

              if (oldVisualPosition !== newVisualPosition) {
                itemPositions.set(itemId, newVisualPosition);

                const originalDOMPosition = sections.findIndex(s => s.id === itemId);
                const itemHeight = itemHeightsRef.current.get(itemId) || 48;
                const absoluteOffset = (newVisualPosition - originalDOMPosition) * itemHeight;

                animate(otherItem as HTMLElement, {
                  translateY: absoluteOffset,
                  duration: 150,
                  ease: 'out(3)',
                });
              }
            });
          }
        },
        onRelease: (self) => {
          const target = self.$target;

          if (!draggedId) {
            target.style.zIndex = '';
            target.style.opacity = '';
            return;
          }

          const finalOrder = currentOrderRef.current;
          const reorderedSections = finalOrder
            .map(id => sections.find(s => s.id === id))
            .filter((s): s is Section => s !== null)
            .map((section, index) => ({ ...section, order: index }));

          const items = Array.from(container.querySelectorAll('.draggable-section'));
          items.forEach((otherItem) => {
            animate(otherItem as HTMLElement, {
              translateY: 0,
              duration: 200,
              ease: 'out(2)',
            });
          });

          setSections(reorderedSections);
          const newOrder = reorderedSections.map(s => s.id);
          localStorage.setItem(storageKey, JSON.stringify(newOrder));

          // Notify parent component of order change
          if (onOrderChange) {
            onOrderChange(newOrder);
          }

          target.style.zIndex = '';
          target.style.opacity = '';
          draggedId = null;
          draggedElement = null;
          lastSwapIndex = -1;
        },
      });
    });

    return () => {
      draggables.forEach((draggable) => {
        if (draggable && typeof draggable.revert === 'function') {
          draggable.revert();
        }
      });
    };
  }, [sections, storageKey]);

  return (
    <ul ref={containerRef}>
      {sections
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const isComplete = isSectionComplete(section.id);
          const hasChanges = hasSectionChanges(section.id);

          return (
            <li key={section.id} className="draggable-section" data-id={section.id}>
              <div className="w-full flex items-center text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                {/* Drag Handle */}
                <div className="drag-handle px-3 py-3 cursor-grab active:cursor-grabbing flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                  </svg>
                </div>

                {/* Section Button */}
                <button
                  type="button"
                  onClick={() => onSectionClick(section.id)}
                  className="flex-1 text-left py-3 pr-6 flex items-center justify-between"
                >
                  <span>{section.label}</span>
                  <div className="flex items-center gap-1">
                    {hasChanges && (
                      <svg
                        className="h-4 w-4 text-amber-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Unsaved changes"
                      >
                        <title>Unsaved changes</title>
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isComplete && !hasChanges && (
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Complete"
                      >
                        <title>Complete</title>
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </li>
          );
        })}
    </ul>
  );
}
