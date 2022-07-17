import webdriver from 'selenium-webdriver';
let driver = new webdriver.Builder().forBrowser('chrome').build();
driver.manage().setTimeouts({ implicit: (10000) });

