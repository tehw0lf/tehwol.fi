import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getProjectFromWorkspace } from '@angular/cdk/schematics';
import { removePackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

import { getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const materialVersion = getPackageVersionFromPackageJson(
      host,
      '@angular/material'
    );
    const workspace = await getWorkspace(host);

    const project = getProjectFromWorkspace(workspace, options.project);

    if (!project) {
      removePackageJsonDependency(host, '@tehw0lf/contact-form');
      context.logger.error(
        `No project specified and can not find default project ${project}`
      );
      context.addTask(new NodePackageInstallTask());
      return;
    }

    if (project.extensions.projectType !== ProjectType.Application) {
      removePackageJsonDependency(host, '@tehw0lf/contact-form');
      context.logger.error(
        'This library needs to be added to an application project'
      );
      context.addTask(new NodePackageInstallTask());
      return;
    }

    if (!materialVersion) {
      removePackageJsonDependency(host, '@tehw0lf/contact-form');
      context.logger.error(`@angular/material not found.
       Please run 'ng add @angular/material' first`);
      context.addTask(new NodePackageInstallTask());
      return;
    }

    context.addTask(new RunSchematicTask('ng-add-setup', options));
  };
}
