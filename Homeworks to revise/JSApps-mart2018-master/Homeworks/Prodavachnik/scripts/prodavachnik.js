function startApp () {
  toggleHeader();
  renderSection(sectionsInfo.viewHome);
  setUpInfoBox();
}

/*function attachEvents () {

  $(CONSTANTS.SELECTORS.FORMS.create.submit).on('click', crud.create);
  $(CONSTANTS.SELECTORS.FORMS.edit.submit).on('click', crud.edit);

  $(CONSTANTS.SELECTORS.TOASTS.error).on('click', () => $(CONSTANTS.SELECTORS.TOASTS.error).fadeOut());


}*/

function setUpInfoBox () {
  $('#loadingBox').hide();
  $(document).on({
    ajaxStart: function () { $('#loadingBox').show(); },
    ajaxStop: function () { $('#loadingBox').hide(); }
  });
}
