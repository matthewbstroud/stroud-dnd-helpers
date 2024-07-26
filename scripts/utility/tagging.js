import { sdndConstants } from "../constants.js";

export let tagging = {
    "tagDocuments": tagDocuments,
    "getTaggedDocuments": getTaggedDocuments
}

async function tagDocuments(documents, scope, key, value) {
    for (let document of documents) {
        await document.setFlag(scope, key, value);
    }
}

async function getTaggedDocuments(collection, scope, key, value) {
    return await collection.filter(i => i.getFlag(scope, key) == value);
}