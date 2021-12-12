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

import { addPackageToPackageJson, getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';

const gitPortfolioModuleName = 'GitPortfolioModule';
const gitPortfolioPackageName = '@tehw0lf/git-portfolio';
const flexLayoutFallbackVersion = '^13.0.0-beta.36';
const githubLanguageColorsFallbackVersion = '^1.0.0';
const octiconsFallbackVersion = '^16.1.1';

export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const coreVersion = getPackageVersionFromPackageJson(host, '@angular/core');
    const flexLayoutVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/flex-layout'
    );
    const githubLanguageColorsVersion = getPackageVersionFromPackageJson(
      host,
      'github-language-colors'
    );
    const octiconsVersion = getPackageVersionFromPackageJson(
      host,
      '@primer/octicons'
    );
    const materialVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/material'
    );
    const angularDependencyVersion = coreVersion || '0.0.0';

    if (!materialVersion || materialVersion !== coreVersion) {
      context.logger
        .error(`@angular/material ${angularDependencyVersion} not found.
       Please run 'ng add @angular/material' first`);
      return;
    }

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

    if (
      !githubLanguageColorsVersion ||
      githubLanguageColorsVersion !== githubLanguageColorsFallbackVersion
    ) {
      addPackageToPackageJson(
        host,
        'github-language-colors',
        githubLanguageColorsFallbackVersion
      );

      context.logger.info(
        `github-language-colors ${githubLanguageColorsFallbackVersion} was added to dependencies.`
      );
    }

    if (!octiconsVersion || octiconsVersion !== octiconsFallbackVersion) {
      addPackageToPackageJson(
        host,
        '@primer/octicons',
        octiconsFallbackVersion
      );
      context.logger.info(
        `@primer/octicons ${octiconsFallbackVersion} was added to dependencies.`
      );
    }

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([addGitPortfolioModule(options)]);
    }
    context.logger.warn('Please specify an application project');
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
