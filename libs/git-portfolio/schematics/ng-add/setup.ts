import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getAppModulePath,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

const gitPortfolioModuleName = 'GitPortfolioModule';
const gitPortfolioPackageName = '@tehw0lf/git-portfolio';

export default function (options: Schema): Rule {
  return async () => {
    return chain([addGitPortfolioModule(options)]);
  };
}

function addGitPortfolioModule(options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
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
    } else {
      context.logger.warn('Library is already installed, nothing to do.');
    }
    return;
  };
}
