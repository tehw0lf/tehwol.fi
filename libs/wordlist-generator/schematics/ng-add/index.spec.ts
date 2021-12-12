import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

import { getFileContent } from '../testing/file-content';
import { createTestApp, createTestAppWithMaterial } from '../testing/test-app';
import { createTestLibrary } from '../testing/test-library';
import { getPackageVersionFromPackageJson } from './package-config';

describe('ng-add schematic with material present', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(async () => {
    runner = new SchematicTestRunner(
      'schematics',
      require.resolve('../collection.json')
    );
    appTree = await createTestAppWithMaterial(runner);

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });
  });

  describe('add module', () => {
    it('should add the WordlistGeneratorModule to the project module', async () => {
      const tree = await runner
        .runSchematicAsync('ng-add', {}, appTree)
        .toPromise();
      const fileContent = getFileContent(
        tree,
        '/projects/material/src/app/app.module.ts'
      );

      expect(fileContent).toContain('WordlistGeneratorModule');
    });
  });
});

describe('ng-add schematic without material present', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(async () => {
    runner = new SchematicTestRunner(
      'schematics',
      require.resolve('../collection.json')
    );
    appTree = await createTestApp(runner);

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });
  });

  describe('fail to add module', () => {
    it('should fail if material is missing', async () => {
      const tree = await runner
        .runSchematicAsync('ng-add', {}, appTree)
        .toPromise();

      const fileContent = getFileContent(
        tree,
        '/projects/material/src/app/app.module.ts'
      );

      const coreVersion = getPackageVersionFromPackageJson(
        tree,
        '@angular/core'
      );

      expect(fileContent).not.toContain('WordlistGeneratorModule');

      expect(errorOutput.length).toBe(1);
      expect(warnOutput.length).toBe(0);
      expect(errorOutput[0])
        .toMatch(`@angular/material ${coreVersion} not found.
       Please run 'ng add @angular/material' first`);
    });
  });
});

describe('ng-add schematic - library project', () => {
  let runner: SchematicTestRunner;
  let libraryTree: Tree;
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(async () => {
    runner = new SchematicTestRunner(
      'schematics',
      require.resolve('../collection.json')
    );
    libraryTree = await createTestLibrary(runner);

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });
  });

  it('should do nothing if a library project is targeted', async () => {
    await runner.runSchematicAsync('ng-add', {}, libraryTree).toPromise();

    expect(errorOutput.length).toBe(1);
    expect(errorOutput[0]).toMatch(
      'This library needs to be added to an application project'
    );
  });
});
