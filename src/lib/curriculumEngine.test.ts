import { describe, it, expect } from 'vitest';
import {
  detectCycle,
  wouldCreateCycle,
  getDependentModules,
  computeModuleStatus,
  initialCurriculumCourses,
} from './curriculumEngine';
import { CurriculumModule } from '../types';

describe('Curriculum Graph & Validation Engine', () => {
  it('detects a simple two-node cycle A -> B -> A', () => {
    const modules = [
      { id: 'mod-a', prerequisiteModuleIds: ['mod-b'] },
      { id: 'mod-b', prerequisiteModuleIds: ['mod-a'] },
    ];
    const result = detectCycle(modules);
    expect(result.hasCycle).toBe(true);
  });

  it('detects a multi-node cycle A -> B -> C -> A', () => {
    const modules = [
      { id: 'mod-a', prerequisiteModuleIds: ['mod-b'] },
      { id: 'mod-b', prerequisiteModuleIds: ['mod-c'] },
      { id: 'mod-c', prerequisiteModuleIds: ['mod-a'] },
    ];
    const result = detectCycle(modules);
    expect(result.hasCycle).toBe(true);
  });

  it('accepts a valid linear DAG A -> B -> C', () => {
    const modules = [
      { id: 'mod-a', prerequisiteModuleIds: [] },
      { id: 'mod-b', prerequisiteModuleIds: ['mod-a'] },
      { id: 'mod-c', prerequisiteModuleIds: ['mod-b'] },
    ];
    const result = detectCycle(modules);
    expect(result.hasCycle).toBe(false);
  });

  it('accepts a valid diamond DAG A -> B, A -> C, B & C -> D', () => {
    const modules = [
      { id: 'mod-a', prerequisiteModuleIds: [] },
      { id: 'mod-b', prerequisiteModuleIds: ['mod-a'] },
      { id: 'mod-c', prerequisiteModuleIds: ['mod-a'] },
      { id: 'mod-d', prerequisiteModuleIds: ['mod-b', 'mod-c'] },
    ];
    const result = detectCycle(modules);
    expect(result.hasCycle).toBe(false);
  });

  it('wouldCreateCycle blocks self-dependency', () => {
    const modules = [{ id: 'mod-a', prerequisiteModuleIds: [] }];
    expect(wouldCreateCycle('mod-a', 'mod-a', modules)).toBe(true);
  });

  it('wouldCreateCycle accurately predicts cycles before adding an edge', () => {
    const modules = [
      { id: 'mod-a', prerequisiteModuleIds: [] },
      { id: 'mod-b', prerequisiteModuleIds: ['mod-a'] },
    ];
    // Adding mod-b as prereq to mod-a would make A require B while B requires A
    expect(wouldCreateCycle('mod-a', 'mod-b', modules)).toBe(true);
    // Adding an unrelated node does not create a cycle
    expect(wouldCreateCycle('mod-b', 'mod-c', [...modules, { id: 'mod-c', prerequisiteModuleIds: [] }])).toBe(false);
  });

  it('finds all dependent modules before deletion', () => {
    const allModules = [
      { id: 'mod-arrays', title: 'Dynamic Arrays', prerequisiteModuleIds: [] },
      { id: 'mod-linked', title: 'Linked Lists', prerequisiteModuleIds: ['mod-arrays'] },
      { id: 'mod-stacks', title: 'Stacks & Queues', prerequisiteModuleIds: ['mod-arrays', 'mod-linked'] },
    ];

    const dependents = getDependentModules('mod-arrays', allModules);
    expect(dependents.map((d) => d.id)).toEqual(['mod-linked', 'mod-stacks']);
  });

  it('computes student module status properly based on prerequisites and completed lessons', () => {
    const moduleA: CurriculumModule = {
      id: 'mod-a',
      courseId: 'c1',
      orderIndex: 1,
      groupLabel: 'Mod 1',
      title: 'Mod A',
      description: '',
      xpReward: 100,
      status: 'published',
      prerequisiteModuleIds: [],
      lessons: [
        { id: 'l1', moduleId: 'mod-a', orderIndex: 1, title: 'Lesson 1', xpValue: 10, lessonType: 'reading' },
        { id: 'l2', moduleId: 'mod-a', orderIndex: 2, title: 'Lesson 2', xpValue: 10, lessonType: 'reading' },
      ],
    };

    const moduleB: CurriculumModule = {
      id: 'mod-b',
      courseId: 'c1',
      orderIndex: 2,
      groupLabel: 'Mod 2',
      title: 'Mod B',
      description: '',
      xpReward: 150,
      status: 'published',
      prerequisiteModuleIds: ['mod-a'],
      lessons: [
        { id: 'l3', moduleId: 'mod-b', orderIndex: 1, title: 'Lesson 3', xpValue: 20, lessonType: 'reading' },
      ],
    };

    // Case 1: Mod A not completed -> Mod B is locked
    const stateB1 = computeModuleStatus(moduleB, [moduleA, moduleB], new Set(), new Set());
    expect(stateB1.status).toBe('locked');
    expect(stateB1.isPrerequisiteSatisfied).toBe(false);

    // Case 2: Mod A completed -> Mod B becomes unlocked
    const stateB2 = computeModuleStatus(moduleB, [moduleA, moduleB], new Set(['mod-a']), new Set());
    expect(stateB2.status).toBe('unlocked');
    expect(stateB2.isPrerequisiteSatisfied).toBe(true);

    // Case 3: Mod B lesson completed -> Mod B becomes completed
    const stateB3 = computeModuleStatus(moduleB, [moduleA, moduleB], new Set(['mod-a']), new Set(['l3']));
    expect(stateB3.status).toBe('completed');
  });

  it('initialCurriculumCourses contains valid non-cyclic courses', () => {
    for (const course of initialCurriculumCourses) {
      const cycleCheck = detectCycle(course.modules || []);
      expect(cycleCheck.hasCycle).toBe(false);
    }
  });
});
