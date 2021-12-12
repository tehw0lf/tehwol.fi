import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getAppModulePath,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

import { getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';

const wordlistGeneratorModuleName = 'WordlistGeneratorModule';
const wordlistGeneratorPackageName = '@tehw0lf/wordlist-generator';

export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const coreVersion = getPackageVersionFromPackageJson(host, '@angular/core');
    const materialVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/material'
    );
    const dependencyVersion = coreVersion || '0.0.0';

    if (!materialVersion || materialVersion !== coreVersion) {
      context.logger.error(`@angular/material ${dependencyVersion} not found.
       Please run 'ng add @angular/material' first`);
      return;
    }

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([addWordlistGeneratorModule(options)]);
    }

    context.logger.warn('Please specify an application project');
    return;
  };
}

function addWordlistGeneratorModule(options: Schema) {
  return async (host: Tree) => {
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
  };
}
