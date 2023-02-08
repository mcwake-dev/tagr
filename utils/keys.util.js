// keys.util.js

/**
 * Create a string key for the apps set
 * @returns {String} Key for apps
 */
function appsKey() {
    const key = `apps`;

    return key;
}

/**
 * Creates a string key for an app
 * @param {String} app_name Name of app
 * @returns {String} Key for app entities set
 */
function appEntitiesKey(app_name) {
    const key = `${appsKey()}!${app_name}!entities`;

    return key;
}

function appEntityKey(app_name, entity_name) {
    const key = `${appEntitiesKey(app_name)}!${entity_name}`;

    return key;
}

/**
 * Creates a string key for app entities
 * @param {String} app_name 
 * @param {String} entity_name 
 * @returns {String} Key for app entity tags
 */
function appEntityTagsKey(app_name, entity_name) {
    const key = `${appEntitiesKey(app_name)}!${entity_name}!tags`;

    return key;
}

/**
 * Creates a string key for the set containing the IDs of entities with a specific tag
 * @param {String} app_name Name of app
 * @param {String} entity_name Name of entity
 * @param {String} tag_name Name of tag
 */
function taggedWithKey(app_name, entity_name, tag_name) {
    const key = `${appEntityKey(app_name, entity_name)}!${entity_name}!taggedwith!${tag_name}`;

    return key;
}

module.exports = {
    appsKey,
    appEntitiesKey,
    appEntityTagsKey,
    taggedWithKey
};