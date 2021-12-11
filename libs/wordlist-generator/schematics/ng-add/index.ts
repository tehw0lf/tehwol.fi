import { chain, Rule, Tree } from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getAppModulePath,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

import { Schema } from './schema';

const wordlistGeneratorModuleName = 'wordlistGeneratorModule';
const wordlistGeneratorPackageName = '@tehw0lf/wordlist-generator';

export default function (options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([addWordlistGeneratorModule(options)]);
    }
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
