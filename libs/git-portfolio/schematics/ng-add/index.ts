import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getProjectFromWorkspace } from '@angular/cdk/schematics';
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

    if (project.extensions.projectType !== ProjectType.Application) {
      context.logger.error(
        'This library needs to be added to an application project'
      );
      return;
    }

    if (!materialVersion) {
      context.logger.error(`@angular/material not found.
       Please run 'ng add @angular/material' first`);
      return;
    }

    context.addTask(new RunSchematicTask('ng-add-setup', options));
  };
}
