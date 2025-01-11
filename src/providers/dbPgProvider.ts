import pgClient from '../core/clients/db-pg'
import fs from 'fs/promises'
import { Client } from 'pg'
import { PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from '../config'

const dbPgProvider = {
  createDatabase: async (databaseName: string) => {
    try {
      // Check if the database already exists
      const checkDbExistsQuery = `SELECT 1 FROM pg_database WHERE datname = '${databaseName}'`
      const result = await pgClient.query(checkDbExistsQuery)

      if (result.rowCount === 0) {
        // Create the database
        await pgClient.query(`CREATE DATABASE ${databaseName}`)
      } else {
        console.log(`Database "${databaseName}" already exists.`)
      }
    } catch (error) {
      console.error('Error creating database:', error)
    } finally {
    }
  },
  removeDatabase: async (databaseName: string) => {
    try {
      await pgClient.query(`DROP DATABASE ${databaseName}`)
    } catch (error) {
      console.error('Error removing database:', error)
    } finally {
    }
  },
  executeSqlFromFile: async (dbName: string) => {
    let filePath: string = 'data/container-db/migration.sql'

    let customPgClient = new Client({
      host: PG_HOST,
      user: PG_USER,
      password: PG_PASSWORD,
      port: Number(PG_PORT),
      database: dbName,
    })

    try {
      await customPgClient.connect()

      // Read SQL file content
      const sqlContent = await fs.readFile(filePath, 'utf-8')

      // Execute SQL content
      await customPgClient.query(sqlContent)
      console.log('SQL file executed successfully.')
    } catch (error) {
      console.error('Error executing SQL file:', error)
    } finally {
      await customPgClient.end()
    }
  },
  listAllDatabases: async () => {
    try {
      const result = await pgClient.query(
        'SELECT datname FROM pg_database WHERE datistemplate = false',
      )
      const databases = result.rows.map((row) => row.datname)
      console.log('Databases:', databases)
      return databases
    } catch (error) {
      console.error('Error listing databases:', error)
      return []
    } finally {
    }
  },
  deleteDatabasesWithPrefix: async (prefix: string, force: boolean = false) => {
    try {
      const result = await pgClient.query(
        'SELECT datname FROM pg_database WHERE datistemplate = false',
      )
      const databasesToDelete = result.rows
        .map((row) => row.datname)
        .filter((name) => name.startsWith(prefix))

      for (const dbName of databasesToDelete) {
        try {
          if (force) {
            // Terminate all connections to the database
            await pgClient.query(`
              SELECT pg_terminate_backend(pg_stat_activity.pid)
              FROM pg_stat_activity
              WHERE pg_stat_activity.datname = '${dbName}' 
              AND pid <> pg_backend_pid();
            `)
            console.log(
              `All connections to database "${dbName}" have been terminated.`,
            )
          }
          await pgClient.query(`DROP DATABASE ${dbName}`)
          console.log(`Database "${dbName}" has been deleted.`)
        } catch (error) {
          console.error(`Error deleting database "${dbName}":`, error)
        }
      }
    } catch (error) {
      console.error('Error deleting databases with prefix:', error)
    } finally {
      await pgClient.end()
    }
  },
}

export default dbPgProvider
