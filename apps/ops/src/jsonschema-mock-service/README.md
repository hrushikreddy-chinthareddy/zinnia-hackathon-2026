Steps to follow for Adding New Task Types/ to support a new TaskType in the system

IMPORTANT!!

1. `Use this folder only for Mocked UI schemas and form Data for development purposes only`
2. `For dynamic forms that are needed for all envs i.e. development as well as production please add them to src/react-json-schema folder`.

`react-json-schema` UI Schema Files:

1. Create the schema JSON file for the new task type.
2. Save it in the appropriate directory: @deps/jsonschema-mock-service/tasks/<carrier>/<task-type>.json.
3. Use the following naming convention:
   Convert the TaskType (e.g., Agent*Nigo) to lowercase and replace underscores (*) with hyphens (-).
   Example: Agent_Nigo → agent-nigo.json.

`react-json-schema` Forma Data Files:

1. Create the data JSON file for the task type.
2. Save it in the appropriate directory: @deps/jsonschema-mock-service/tasks-data/<carrier>/<task-type>.json.
3. Follow the same naming convention as schema files.

Validation:

1. Test the new task type by passing it to `getTaskFormMetadataSSRMock` and `getCaseTaskByIdSSRMock` to confirm the files are dynamically loaded.
2. Directory Structure for Multi-Tenancy:
   The carrier parameter (defaulting to 'WELB') is used to target specific client directories.
3. When adding new task types for a specific client:
   Create a subdirectory under tasks and tasks-data for the client (e.g., @deps/jsonschema-mock-service/tasks/<client-id>/).
4. Place the client-specific schema/data files in the subdirectory.
