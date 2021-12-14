import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addModuleImportToRootModule,
  getAppModulePath,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { addPackageToPackageJson, getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';

const wordlistGeneratorModuleName = 'WordlistGeneratorModule';
const wordlistGeneratorPackageName = '@tehw0lf/wordlist-generator';
const flexLayoutFallbackVersion = '^13.0.0-beta.36';

export default function (options: Schema): Rule {
  return async () => {
    return chain([addDependencies(), addWordlistGeneratorModule(options)]);
  };
}

function addWordlistGeneratorModule(options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));

    if (!hasNgModuleImport(host, appModulePath, wordlistGeneratorModuleName)) {
      addModuleImportToRootModule(
        host,
        wordlistGeneratorModuleName,
        wordlistGeneratorPackageName,
        project
      );
    }
    context.logger.warn('Library is already installed, nothing to do.');
    return;
  };
}

function addDependencies(): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const flexLayoutVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/flex-layout'
    );

    if (!flexLayoutVersion || flexLayoutVersion !== flexLayoutFallbackVersion) {
      addPackageToPackageJson(
        host,
        '@angular/flex-layout',
        flexLayoutFallbackVersion
      );

      context.logger.info(
        `@angular/flex-layout ${flexLayoutFallbackVersion} was added to dependencies.`
      );
    }
    context.addTask(new NodePackageInstallTask());
  };
}
