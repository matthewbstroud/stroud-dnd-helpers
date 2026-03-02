
export let customFilters = {
    "prepareSpellListFilters": async function _prepareSpellListFilters() {
        const sheetClass = dnd5e.applications.actor.BaseActorSheet;
        const original = sheetClass.prototype._prepareSpellsContext;

        sheetClass.prototype._prepareSpellsContext = async function (context, options) {
            context = await original.call(this, context, options);
            context.listControls ??= {};
            context.listControls.filters ??= [];
            if (!context.listControls.filters.some(f => f.key === "usable")) {
                context.listControls.filters.push({ key: "usable", label: "sdnd.usable" });
            }
            return context;
        };
    },
    "filterUsableSpells": function _filterUsableSpells(sheet, item, filters) {
        if (!filters.has("usable")) return;
        if (item.type !== "spell") return;
        const actor = item.parent;
        const prepared = item.system.canPrepare && !!item.system.prepared;
        const ritual = item.system.properties?.has("ritual");
        const atWill = item.system.method === "atwill";
        const innate = item.system.method === "innate";

        // Wizards can cast ritual spells without preparing them
        const spellIsWizard = item.system.sourceClass === "wizard";
        const actorHasWizard = "wizard" in actor.classes;
        const ritualUsable = (spellIsWizard && actorHasWizard && ritual) || (ritual && prepared);

        return (prepared || ritualUsable || atWill || innate);
    }
}