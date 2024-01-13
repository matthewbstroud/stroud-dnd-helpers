import { promises as fs } from "fs";
const replacements = [
    ['modules/sdnd-mines-adv/sfx/crackling-fireplace-nature-sounds-8012.mp3', 'modules/stroud-dnd-helpers/sfx/crackling-fireplace-nature-sounds-8012.mp3'],
    ['modules/sdnd-mines-adv/sfx/boiling-pot-of-water-29626.mp3', 'modules/stroud-dnd-helpers/sfx/boiling-pot-of-water-29626.mp3'],
    ['https://assets.forge-vtt.com/634b24b96df3a5a10e8ccd71/SFX/crackling-fireplace-nature-sounds-8012.mp3', 'modules/stroud-dnd-helpers/sfx/crackling-fireplace-nature-sounds-8012.mp3'],
    ['modules/sdnd-mines-adv/images/maps/', 'modules/stroud-dnd-helpers/images/maps/'],
    ['modules/sdnd-mines-adv/images/custom_icons/Fireplace_Icon.webp', 'modules/stroud-dnd-helpers/images/icons/Fireplace_Icon.webp'],
    ['"/custom_icons/Fireplace_Icon.webp"', '"modules/stroud-dnd-helpers/images/icons/Fireplace_Icon.webp"']
];
const MODULE_ID = process.cwd();
const desiredThumbPath = `modules/${process.env.npm_package_name}/images/thumbs/`;
const basePath = "./src/packs";
const packs = await fs.readdir(basePath);
let fileModfied = false;
for (const pack of packs) {
    if (pack === ".gitattributes") continue;
    if (pack !== "sdnd-common-scenes") continue;
    const fileFolder = basePath + '/' + pack;
    const files = await fs.readdir(fileFolder);
    for (const file of files) {
        const filePath = fileFolder + '/' + file;
        console.log("Fixing " + file);
        let fileObject = {};
        try {
            let filedata = await fs.readFile(filePath, { encoding: 'utf8' });
            for (let replacement of replacements) {
                filedata = filedata.replaceAll(replacement[0], replacement[1]);
            }
            fileObject = JSON.parse(filedata);

        } catch (err) {
            console.log(err);
            continue;
        }
        if (fileObject.scenes) {
            for (let scene of fileObject.scenes) {
                if (scene.thumb.startsWith(desiredThumbPath)){
                    continue;
                }
                fileModfied = true;
                console.log(`Modifying scene '${scene.name}'...`);
                console.log(`   Old Path: '${scene.thumb}'`);
                let newPath = desiredThumbPath + scene.thumb.split('/').pop();
                console.log(`   New Path: '${newPath}'`);
                scene.thumb = newPath;
            }
        }
        else if (fileObject.thumb && !fileObject.thumb.startsWith(desiredThumbPath)){
            console.log(`Modifying scene '${fileObject.name}'...`);
            console.log(`   Old Path: '${fileObject.thumb}'`);
            let newPath = desiredThumbPath + fileObject.thumb.split('/').pop();
            console.log(`   New Path: '${newPath}'`);
            fileObject.thumb = newPath;
        }
        try {
            await fs.writeFile(filePath, JSON.stringify(fileObject, null, 2));
            console.log("Save successful.");
        }
        catch (err) {
            console.log(err);
        }
        //console.log(fileObject.scenes.map(s => ({ "thumb": s.thumb })));
    }

    

}
console.log("finished");