export let dialog = {
    "createButtonDialog": async function _createButtonDialog(title, buttons) {
        let selected = await warpgate.buttonDialog(
            {
                buttons,
                title
            },
            'column'
        );
        return selected;
    }
};