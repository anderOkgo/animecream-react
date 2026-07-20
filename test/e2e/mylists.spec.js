import { test, expect } from '@playwright/test';

// MyLists golden path -- entirely localStorage-based (no real backend
// mutation), unlike admin.spec.js. Exercises the actual live component,
// ListManager.jsx (the only one of the four files under
// src/Components/MyLists/ that's ever imported by the running app --
// MyLists.jsx, AddToListModal.jsx, and ListView.jsx were dead code,
// confirmed via grep and deleted alongside this test).
test.describe('MyLists: create a list, add a card, remove it, delete the list', () => {
  test('full lifecycle via the real UI', async ({ page }) => {
    const listName = `__E2E_TEST_LIST_${Date.now()}__`;

    await page.goto('/');
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    // CardRow renders the title twice: h2[0] is "#<rank>. <name>" (compact
    // tab), h2[1] is the plain "<name>" (full tab) -- the plain form is
    // what gets stored as the list item's name (see Tab.jsx's
    // addSeriesToSelectedList / CardRow's onAddToList({ id, name })). Read
    // fresh right before each use rather than cached once at the top: the
    // catalog can reorder between steps (cache-then-network refresh), and
    // `firstCard` is a live locator that would then point at a different
    // series than whatever title was captured earlier.
    const getFirstCardTitle = async () => (await firstCard.locator('h2').nth(1).textContent()).trim();

    // No list selected yet -- clicking "+" opens ListManager instead of
    // adding directly (see Tab.jsx's handleAddToList).
    await firstCard.locator('.card-add-to-list-btn').click();
    const modal = page.locator('.list-manager-modal');
    await expect(modal).toBeVisible();

    // Create a new list; ListManager auto-selects it once created.
    await modal.getByRole('button', { name: '+ Add List' }).click();
    await modal.locator('input[type="text"]').fill(listName);
    await modal.getByRole('button', { name: 'Create' }).click();
    await expect(modal.locator('.list-select')).toHaveValue(/^list_\d+$/);

    // Close the modal, then add the same card -- this time it goes
    // straight in (no modal) since a list is already selected.
    await modal.locator('.close-btn').click();
    await expect(modal).toBeHidden();
    const addedTitle = await getFirstCardTitle();
    await firstCard.locator('.card-add-to-list-btn').click();
    await expect(firstCard.locator('.card-add-to-list-btn')).toHaveClass(/added/);

    // Reopen ListManager via the toolbar and confirm the card landed
    // in the list.
    await page.getByRole('button', { name: '☰ My Lists' }).click();
    await expect(modal).toBeVisible();
    await expect(modal.getByText(addedTitle, { exact: true })).toBeVisible();

    // Remove the item, then delete the whole list.
    await modal.locator('.remove-item-btn').click();
    await expect(modal.locator('.empty-list')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await modal.locator('.btn-delete-list').click();
    await expect(modal.locator('.list-select')).not.toHaveValue(/^list_\d+$/);

    await modal.locator('.close-btn').click();
    await expect(modal).toBeHidden();
  });
});
