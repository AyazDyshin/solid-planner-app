import pkg from 'selenium-webdriver';
const { Builder, By, until } = pkg;
import chrome from 'selenium-webdriver/chrome.js';
import { before, after, describe, it } from "mocha";
import { suite } from 'selenium-webdriver/testing/index.js';
import { config } from './config.mjs';

suite(function () {
    describe('Main test suite', function () {
        this.timeout(50000);

        let driver;
        const waitThenClick = async (selector) => {
            await driver.wait(
                until.elementLocated(selector)
            );
            await driver.findElement(selector)
                .click();
        };

        before(async function () {
            const options = new chrome.Options();
            options.setAcceptInsecureCerts(true);

            driver = await new Builder().forBrowser('chrome').build();

            await driver.get(config.appSettings.url);
            await driver.findElement(By.css(".provider-input"))
                .sendKeys(config.mainPodSettings.provider);
            await driver.findElement(By.css(".login-button"))
                .click();
            await driver.wait(
                until.urlContains(config.mainPodSettings.provider)
            );
            await driver.findElement(By.id('username'))
                .sendKeys(config.mainPodSettings.username);
            await driver.findElement(By.id('password'))
                .sendKeys(config.mainPodSettings.password);
            await driver.findElement(By.id('login'))
                .click();
            try {
                await driver.findElement(By.css('[name=access_mode]:not(:checked)'))
                    .click();
                await driver.findElement(By.css('button[type=submit][name=consent]'))
                    .click();
            } catch (e) {
                console.log(e);
            }
            await driver.wait(
                until.urlContains(config.appSettings.url)
            );
            await driver.wait(
                until.urlMatches(/^(?!.*code=)/)
            );
            await driver.wait(
                until.elementLocated(By.id("logout-button"))
            );
        });
        after(() => driver.quit());

        it('Create a note', async function () {
            await driver.get(config.appSettings.url);
            await driver.wait(
                until.elementLocated(By.id("logout-button"))
            );
            await waitThenClick(By.css(".create-note-button"));
            const titleInput = await driver.findElement(By.css(".note-title-input"));
            await titleInput.sendKeys("Test title(created by Selenium)");
            const contentInput = await driver.findElement(By.css(".note-content-input"));
            await contentInput.sendKeys("Test content(created by Selenium)");
            await waitThenClick(By.css(".save-note-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title(created by Selenium)']"))
            )
        })

        it('Edit a note and set category', async function () {
            await waitThenClick(By.xpath("//*[text()='Test title(created by Selenium)']"));
            await waitThenClick(By.id("input-group-dropdown-1"))
            await waitThenClick(By.css(".note-edit"))
            const titleInput2 = await driver.findElement(By.css(".note-title-input"));
            await titleInput2.clear()
            await titleInput2.sendKeys("Test title upd(created by Selenium)");
            const contentInput2 = await driver.findElement(By.css(".note-content-input"));
            await contentInput2.clear()
            await contentInput2.sendKeys("Test content upd(created by Selenium)");
            await waitThenClick(By.id("input-group-dropdown-1"))
            await waitThenClick(By.css(".note-set-category"));
            const categoryInput = await driver.findElement(By.css(".category-input"));
            await categoryInput.sendKeys("Test category(created by Selenium)");
            await waitThenClick(By.css(".set-category"));
            await waitThenClick(By.css(".save-note-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
            )
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test category(created by Selenium)']"))
            )
        })

        it('Set note to be public', async function () {
            await waitThenClick(By.xpath("//*[text()='Test title upd(created by Selenium)']"));
            await waitThenClick(By.id("input-group-dropdown-1"))
            await waitThenClick(By.css(".share-note"))
            await waitThenClick(By.css(".set-read"))
            await waitThenClick(By.css(".set-access"))
            await waitThenClick(By.css(".save-note-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='public']"))
            )
        })
        it('Delete a note', async function () {
            await waitThenClick(By.css(".delete-note"))
            await waitThenClick(By.css(".confirm-delete"))
            await driver.manage().setTimeouts({ implicit: 4000 });
            try {
                await driver.findElement(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
                return false;
            }
            catch {

                return true;
            }
        })

        it('Create a habit', async function () {
            await driver.wait(
                until.elementLocated(By.id("logout-button"))
            );
            await waitThenClick(By.css(".habits"));
            await waitThenClick(By.css(".create-habit-button"));
            const titleInput = await driver.findElement(By.css(".habit-title-input"));
            await titleInput.sendKeys("Test title(created by Selenium)");
            const contentInput = await driver.findElement(By.css(".habit-content-input"));
            await contentInput.sendKeys("Test content(created by Selenium)");
            await waitThenClick(By.css(".save-habit-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title(created by Selenium)']"))
            )
        })

        it('Edit a habit and set category', async function () {
            await waitThenClick(By.xpath("//*[text()='Test title(created by Selenium)']"));
            await waitThenClick(By.id("input-group-dropdown-1"))
            await waitThenClick(By.css(".habit-edit"))
            const titleInput2 = await driver.findElement(By.css(".habit-title-input"));
            titleInput2.clear();
            await titleInput2.sendKeys("Test title upd(created by Selenium)");
            const contentInput2 = await driver.findElement(By.css(".habit-content-input"));
            contentInput2.clear();
            await contentInput2.sendKeys("Test content upd(created by Selenium)");
            await waitThenClick(By.css(".habit-menu"))
            await waitThenClick(By.css(".habit-set-category"));
            const categoryInput = await driver.findElement(By.css(".category-input"));
            await categoryInput.sendKeys("Test category(created by Selenium)");
            await waitThenClick(By.css(".set-category"));
            await waitThenClick(By.css(".save-habit-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
            )
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test category(created by Selenium)']"))
            )
        })


        it('Set habit as done then view it in done filter category', async function () {
            await waitThenClick(By.xpath("//*[text()='Test title upd(created by Selenium)']"));
            await waitThenClick(By.css(".habit-menu"))
            await waitThenClick(By.css(".habit-edit"))
            await waitThenClick(By.css(".form-check"));
            await waitThenClick(By.css(".save-habit-button"));
            await waitThenClick(By.css(".habit-status-filter"));
            await waitThenClick(By.css(".habit-status-done-filter"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
            )
        })

        it('view habit in calendar view', async function () {
            await waitThenClick(By.css(".calendar-view-button"));
            await driver.wait(
                until.elementLocated(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
            )
            await waitThenClick(By.css(".btn-close"));
        })


        it('Delete a habit', async function () {
            await waitThenClick(By.css(".delete-habit"))
            await waitThenClick(By.css(".confirm-delete"))
            await driver.manage().setTimeouts({ implicit: 4000 });
            try {
                await driver.findElement(By.xpath("//*[text()='Test title upd(created by Selenium)']"))
                return false;
            }
            catch {

                return true;
            }
        })

        it('View contacts list and available note', async function () {
            await waitThenClick(By.css(".contacts"));
            await waitThenClick(By.xpath("//*[text()='Tester']"));
            await waitThenClick(By.xpath("//*[text()='Welcome to solid planner app']"));
            await waitThenClick(By.xpath("//*[text()='test message']"));
            await waitThenClick(By.css(".btn-close"));
        })

        it('Logout', async function () {
            await waitThenClick(By.id("logout-button"));
            await driver.wait(
                until.elementLocated(By.css(".login-button"))
            )
        })
    })
});


