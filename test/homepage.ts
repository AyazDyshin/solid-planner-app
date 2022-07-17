import {describe,before, after} from 'mocha'

describe('this is describe block', function(){
    this.timeout(50000);
    beforeEach(function(){

    });
    afterEach(function(){

    });

    it('POM test', function(){
        let baseurl = 'https://http://localhost:8080/'
    })
})

suite(function (env) {
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

            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeService(serviceBuilder)
                .setChromeOptions(options)
                .build();

            if (mainPodSettings.register) {
                await driver.get(`${mainPodSettings.url}/register`);
                await driver.findElement(By.id('username'))
                    .sendKeys(mainPodSettings.username);
                await driver.findElement(By.id('password'))
                    .sendKeys(mainPodSettings.password);
                await driver.findElement(By.id('repeat_password'))
                    .sendKeys(mainPodSettings.password);
                await driver.findElement(By.id('name'))
                    .sendKeys(mainPodSettings.name);
                await driver.findElement(By.id('email'))
                    .sendKeys(mainPodSettings.email);
                await driver.findElement(By.id("register")).click();

                // if the account already exists, an alert is displayed,
                // otherwise wait for a successful redirect after the registration is complete
                try {
                    driver.findElement(By.css(".alert.alert-danger"))
                } catch (e) {
                    await driver.wait(
                        until.titleIs("Welcome to Solid"),
                        10000
                    );
                }
            }

            await driver.get(appSettings.url);
            await driver.findElement(By.css(".testing-login-link"))
                .click();
            await driver.wait(
                until.urlContains('login')
            );
            await driver.findElement(By.css(".testing-login-webid-input"))
                .sendKeys(mainPodSettings.webId);
            await driver.findElement(By.css(".testing-login-submit"))
                .click();
            await driver.wait(
                until.urlContains(mainPodSettings.url)
            );
            await driver.findElement(By.id('username'))
                .sendKeys(mainPodSettings.username);
            await driver.findElement(By.id('password'))
                .sendKeys(mainPodSettings.password);
            await driver.findElement(By.id('login'))
                .click();

            // if the solid pod is connected to the app for the first time,
            // we have to fill out a consent form, otherwise, the app redirects us automatically back
            try {
                await driver.findElement(By.css('[name=access_mode]:not(:checked)'))
                    .click();
                await driver.findElement(By.css('button[type=submit][name=consent]'))
                    .click();
            } catch (e) {
            }

            await driver.wait(
                until.urlContains(appSettings.url)
            );
            await driver.wait(
                until.urlMatches(/^(?!.*code=)/)
            );

            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );
        });

        after(() => driver.quit());

        it('Create a note', async function () {
            await driver.get(appSettings.url);

            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );

            await waitThenClick(By.css(".testing-open-pod-browser-button"));
            await waitThenClick(By.css(".testing-pod-browser-public-folder"));
            await waitThenClick(By.css(".testing-create-note-here"));
            await waitThenClick(By.css(".testing-create-note-submit:not(:disabled)"));

            await driver.wait(
                until.elementLocated(By.css(".testing-note-title-input"))
            );
            const titleInput = await driver.findElement(By.css(".testing-note-title-input"));
            await titleInput.clear();
            await titleInput.sendKeys("TEST (created by Selenium)");
            await driver.wait(
                until.elementLocated(By.css(".testing-note-saving-saved"))
            );
            const wysiwygEditor = await driver.findElement(By.css(".testing-note-wysiwyg-editor"));
            await wysiwygEditor.sendKeys("This is a test.");
            await driver.wait(
                until.elementLocated(By.css(".testing-note-saving-saved"))
            );
        });

        it('Remove the note from the list of notes', async function () {
            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );

            await waitThenClick(By.css(".testing-remove-current-note-from-list"));

            await driver.wait(
                until.elementLocated(By.css(".testing-add-current-note-to-list"))
            );
        });

        it('Add the note to the list of notes', async function () {
            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );

            await waitThenClick(By.css(".testing-add-current-note-to-list"));

            await driver.wait(
                until.elementLocated(By.css(".testing-remove-current-note-from-list"))
            );
        });

        it('Share the note', async function () {
            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );

            await waitThenClick(By.css(".testing-share-note-button"));
            await waitThenClick(By.css(".testing-share-note-add-user-tab"));
            await driver.wait(
                until.elementLocated(By.css(".testing-add-new-user-webid-input"))
            );
            await driver.findElement(By.css(".testing-add-new-user-webid-input"))
                .sendKeys(secondaryPodSettings.webId);
            await waitThenClick(By.css(".testing-add-new-user-submit:not(:disabled)"));
            await waitThenClick(By.css(".testing-share-note-current-permissions-tab"));
            await waitThenClick(By.css(".testing-share-note-save-permissions:not(:disabled)"));
            await waitThenClick(By.css(".testing-share-note-close-button"))
            
            // currently - the value of Select cannot be changed using the JavaScript API,
            // otherwise, it would be ideal to change the access level here
            // https://www.selenium.dev/documentation/support_packages/working_with_select_elements/
        });

        it('Delete the note', async function () {
            await driver.wait(
                until.elementLocated(By.css(".testing-logout-button"))
            );

            await waitThenClick(By.css(".testing-delete-note-button:not(:disabled)"));
            await waitThenClick(By.css(".testing-delete-note-submit"));

            await driver.wait(
                until.urlMatches(/^(?!.*\/note\/)/)
            );
        });

        it('Log out', async function () {
            await waitThenClick(By.css(".testing-logout-button"));
        });
    });
});
