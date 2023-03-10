/* eslint-disable no-unused-expressions */
/**
 * @file Contains tests for Player actor sheets
 */
import {
	cleanUpActorsByKey,
	closeSheets,
	abilities,
	waitForInput,
	openDialogs,
	trashChat,
	cleanUpItemsByKey,
} from "../../testing/testUtils.mjs";

export const key = "shadowdark.sheets.player";
export const options = {
	displayName: "ShadowDark: Sheets: Player",
};

const createMockActor = async type => {
	return Actor.create({
		name: `Test Actor ${key}: ${type}`,
		type,
	});
};

const createMockItem = async type => {
	return Item.create({
		name: `Test Item ${key}: ${type}`,
		type,
	});
};

export default ({ describe, it, after, before, expect }) => {
	after(async () => {
		cleanUpActorsByKey(key);
	});

	describe("defaultOptions", () => {
		let actor = {};
		before(async () => {
			actor = await createMockActor("Player");
		});

		it("has the expected CSS classes", async () => {
			expect(actor.sheet.options.classes).is.not.undefined;
			expect(actor.sheet.options.classes).contain("shadowdark");
			expect(actor.sheet.options.classes).contain("sheet");
			expect(actor.sheet.options.classes).contain("player");
		});

		it("is resizable", async () => {
			expect(actor.sheet.options.resizable).is.not.undefined;
			expect(actor.sheet.options.resizable).is.true;
		});

		it("has the expected window width", async () => {
			expect(actor.sheet.options.width).is.not.undefined;
			expect(actor.sheet.options.width).equal(560);
		});

		it("has the expected window height", async () => {
			expect(actor.sheet.options.height).is.not.undefined;
			expect(actor.sheet.options.height).equal(560);
		});

		it("has the expected tabs", async () => {
			expect(actor.sheet.options.tabs).is.not.undefined;
			expect(actor.sheet.options.tabs.length).equal(1);
			expect(actor.sheet.options.tabs[0].navSelector).is.not.undefined;
			expect(actor.sheet.options.tabs[0].navSelector).equal(".player-navigation");
			expect(actor.sheet.options.tabs[0].contentSelector).is.not.undefined;
			expect(actor.sheet.options.tabs[0].contentSelector).equal(".player-body");
			expect(actor.sheet.options.tabs[0].initial).is.not.undefined;
			expect(actor.sheet.options.tabs[0].initial).equal("pc-tab-abilities");
		});
	});

	describe("getData(options)", () => {
		let actor = {};
		let actorData = {};

		before(async () => {
			actor = await createMockActor("Player");
			actorData = await actor.sheet.getData();
		});

		it("contains the xpNextLevel data", () => {
			expect(actorData.xpNextLevel).is.not.undefined;
		});
		it("contains the armorClass data", () => {
			expect(actorData.armorClass).is.not.undefined;
		});

		after(async () => {
			await actor.delete();
		});
	});

	/* Event-based methods */
	describe("_onItemQuantityDecrement(event)", () => {
		let actor = {};

		before(async () => {
			actor = await createMockActor("Player");
			await actor.sheet.render(true);
			await waitForInput();
			await document.querySelector("a[data-tab=\"tab-inventory\"]").click();
			await waitForInput();
			// @todo: create item with quantity
		});

		// @todo: write tests when sheet functions are implemented
		it("decreases quantity when clicked in Player sheet", async () => {});
		it("deletes item when quantity becomes 0", async () => {});

		after(async () => {
			await actor.delete();
			await closeSheets();
		});
	});

	describe("_onItemQuantityIncrement(event)", () => {
		let actor = {};

		before(async () => {
			actor = await createMockActor("Player");
			await actor.sheet.render(true);
			await waitForInput();
			await document.querySelector("a[data-tab=\"tab-inventory\"]").click();
			await waitForInput();
			// @todo: create item with quantity
		});

		// @todo: write tests when sheet functions are implemented
		it("increases quantity when clicked in Player sheet", async () => {});
		it("increases slots used when exceeding per slot value", async () => {});

		after(async () => {
			await actor.delete();
			await closeSheets();
		});
	});

	describe("_onRollAbilityCheck(event)", () => {
		let actor = {};

		before(async () => {
			await trashChat();
			actor = await createMockActor("Player");
			await actor.sheet.render(true);
			await waitForInput();
			await document.querySelector("a[data-tab=\"tab-abilities\"]").click();
			await waitForInput();
		});

		// @todo: If implementing invertedCtrlBehavior - store & restore settings

		abilities.forEach(ability => {
			it(`rolls and displays result in chat for ${ability} ability roll`, async () => {
				// Clear out chat
				await trashChat();
				expect(game.messages.size).equal(0);

				// Click ability
				const element = document.querySelector(`label[data-ability="${ability}"]`);
				expect(element).is.not.null;
				await element.click();
				await waitForInput();

				// Verify dialog generated
				const dialogs = openDialogs();
				expect(dialogs.length).equal(1);

				const rollElement = document.querySelector(".dialog .OK");
				expect(rollElement).is.not.null;
				await rollElement.click();
				await waitForInput();

				expect(game.messages.size).equal(1);
				const message = game.messages.contents.pop();

				// @todo: Test the resulting roll chat card

				await message.delete();
			});
		});

		after(async () => {
			await actor.delete();
			await closeSheets();
			await trashChat();
		});
	});

	describe("_onToggleEquipped(event)", () => {
		let actor = {};
		let item = {};
		let actorItem = {};

		["Armor", "Weapon"].forEach(type => {
			describe(`${type}`, () => {
				before(async () => {
					actor = await createMockActor("Player");
					item = await createMockItem("Armor");
					[actorItem] = await actor.createEmbeddedDocuments("Item", [item]);
					await item.delete();

					await actor.sheet.render(true);
					await waitForInput();
					await document.querySelector("a[data-tab=\"tab-inventory\"]").click();
					await waitForInput();
				});

				it("click on the equip shirt equips the item", async () => {
					expect(actorItem.system.equipped).is.false;
					const element = document.querySelector("a.item-toggle-equipped");
					expect(element).is.not.null;
					await element.click();
					await waitForInput();

					expect(actorItem.system.equipped).is.true;
				});
				it("click on the equip shirt again unequips the item", async () => {
					expect(actorItem.system.equipped).is.true;
					const element = document.querySelector("a.item-toggle-equipped");
					expect(element).is.not.null;
					await element.click();
					await waitForInput();

					expect(actorItem.system.equipped).is.false;
				});

				after(async () => {
					await actor.delete();
					await closeSheets();
					cleanUpActorsByKey(key);
					cleanUpItemsByKey(key);
				});
			});
		});
	});

	/* Non-event tests */

	// @todo: determine what tests are needed here, has a lot of branches
	describe("_prepareItems(context)", () => {});

	// @todo: is there any circumstance where this needs to be tested more than
	//        already done in _prepareItems(context)?
	describe("_sortAllItems(context)", () => {});
};