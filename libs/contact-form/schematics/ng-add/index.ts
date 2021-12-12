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

const contactFormModuleName = 'ContactFormModule';
const contactFormPackageName = '@tehw0lf/contact-form';
const flexLayoutFallbackVersion = '^13.0.0-beta.36';

export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const coreVersion = getPackageVersionFromPackageJson(host, '@angular/core');
    const flexLayoutVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/flex-layout'
    );
    const materialVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/material'
    );
    const dependencyVersion = coreVersion || '0.0.0';

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

    if (!materialVersion || materialVersion !== coreVersion) {
      context.logger.error(`@angular/material ${dependencyVersion} not found.
       Please run 'ng add @angular/material' first`);
      return;
    }

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([addContactFormModule(options)]);
    }
    context.logger.warn('Please specify an application project');
    return;
  };
}

function addContactFormModule(options: Schema) {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));

    if (!hasNgModuleImport(host, appModulePath, contactFormModuleName)) {
      addModuleImportToRootModule(
        host,
        contactFormModuleName,
        contactFormPackageName,
        project
      );
    }
  };
}
