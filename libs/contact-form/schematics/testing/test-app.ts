import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';

import { getPackageVersionFromPackageJson } from '../ng-add/package-config';
import { getFileContent } from './file-content';
import { createTestProject } from './test-project';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Create a base app used for testing. */
export async function createTestApp(
  runner: SchematicTestRunner,
  appOptions = {},
  tree?: Tree
): Promise<UnitTestTree> {
  return createTestProject(runner, 'application', appOptions, tree);
}

export async function createTestAppWithMaterial(
  runner: SchematicTestRunner,
  appOptions = {},
  tree?: Tree
): Promise<UnitTestTree> {
  const projectTree = await createTestProject(
    runner,
    'application',
    appOptions,
    tree
  );

  const coreVersion = getPackageVersionFromPackageJson(
    projectTree,
    '@angular/core'
  );

  const packageJson = getFileContent(projectTree, '/package.json');

  const updatedPackageJson = packageJson.replace(
    `"dependencies": {
    "@angular/animations": "${coreVersion}",`,
    `"dependencies": {
    "@angular/animations": "${coreVersion}",
    "@angular/material": "${coreVersion}",`
  );
  projectTree.overwrite('/package.json', updatedPackageJson);
  return projectTree;
}
