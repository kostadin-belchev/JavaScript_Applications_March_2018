define(['jquery', 'displayElements', 'attachEvents'], function ($, displayElements, attachEvents) {
    $(() => {
        displayElements.showHideMenuLinks();
        displayElements.showHomeView();
        attachEvents();
    });
});