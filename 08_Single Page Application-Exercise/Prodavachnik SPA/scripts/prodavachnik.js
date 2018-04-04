function startApp() {
    // at startup show and hide links depending on user login status and go to home view
    showHideMenuLinks();
    showView('viewHome');
    attachAllEvents();
}