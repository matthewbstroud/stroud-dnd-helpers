# Protection of the Talisman

This automation applies when the actor making a saving throw has the Eldritch Invocation with the identifier `eldritch-invocations-protection-of-the-talisman` and has at least one available use.

- A saving throw with a known DC prompts only after it fails.
- A character-sheet saving throw without a DC prompts after the roll.
- Choosing **Use Protection** adds a visible `1d4` to that save and spends one use.
- Declining the prompt leaves the roll and uses unchanged.
- The automation evaluates formula-based use limits such as `@prof` and leaves the feature's configured long-rest recovery intact.

The triggering actor is the only eligibility check. The current user's ownership does not determine whether the feature can trigger; a GM socket update is used when required to spend the embedded item's use.