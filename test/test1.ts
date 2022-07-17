import webdriver, { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import path from 'path';
const serviceBuilder = new chrome.ServiceBuilder(path.dirname(__dirname) + "/node_modules/chromedriver/bin/chromedriver");
import { before, after } from "mocha";
import { suite } from 'selenium-webdriver/testing';
import { config } from './config';

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

            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeService(serviceBuilder)
                .setChromeOptions(options)
                .build();

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
                until.elementLocated(By.css(".logout-button"))
            );
        });
        after(() => driver.quit());
    })
});


