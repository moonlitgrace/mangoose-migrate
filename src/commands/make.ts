import fs from 'fs/promises';
import path from 'path';
import { MigrationConfig } from '../types.js';

const MIGRATION_TEMPLATE = `import { Migration } from "mangoose-migrate/core";
import { CreateModel, AddField } from "mangoose-migrate/operations";

export default class {{className}} extends Migration {
  constructor() {
    super('{{name}}');
  }

  async up(db) {
    // Add your migration operations here
    // this.addOperation(new CreateModel('User', { name: String }));
    // this.addOperation(new AddField('User', 'email', { type: String }));
  }

  async down(db) {
    // Add rollback operations here
  }
}
`;

export class MakeCommand {
  constructor(private readonly config: MigrationConfig) {}

  async execute(name: string): Promise<void> {
    // ensure migrations path exists
    await fs.mkdir(this.config.migrationsPath, { recursive: true });

    // get next migration number
    const files = await fs.readdir(this.config.migrationsPath);
    const nextNum = files.length + 1;
    const migrationNum = nextNum.toString().padStart(4, '0');

    // normalize name
    // https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-120.php
    const _name = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
    // create filename
    const filename = `${migrationNum}_${_name}.js`;
    const filepath = path.join(this.config.migrationsPath, filename);

    // generate class name from name in PascalCase
    const className = name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    const content = MIGRATION_TEMPLATE.replace(/{{className}}/g, className).replace(
      /{{name}}/g,
      name,
    );

    // write file
    await fs.writeFile(filepath, content);
    console.log(`Created migration: ${filename}`);
  }
}
