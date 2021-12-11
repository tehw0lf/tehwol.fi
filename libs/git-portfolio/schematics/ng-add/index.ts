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

const gitPortfolioModuleName = 'gitPortfolioModule';
const gitPortfolioPackageName = '@tehw0lf/git-portfolio';

export default function (options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([addGitPortfolioModule(options)]);
    }
    return;
  };
}

function addGitPortfolioModule(options: Schema) {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));

    if (!hasNgModuleImport(host, appModulePath, gitPortfolioModuleName)) {
      addModuleImportToRootModule(
        host,
        gitPortfolioModuleName,
        gitPortfolioPackageName,
        project
      );
    }
  };
}
