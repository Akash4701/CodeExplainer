function doPost(event) {
  try {
    const parameters = event && event.parameter ? event.parameter : {};
    const rating = Number(parameters.rating);
    const feedback = String(parameters.feedback || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !feedback || feedback.length > 2000) {
      throw new Error("Invalid rating or feedback.");
    }

    const properties = PropertiesService.getScriptProperties();
    const formId = properties.getProperty("FORM_ID");
    const ratingItemIdValue = properties.getProperty("RATING_ITEM_ID");
    const feedbackItemIdValue = properties.getProperty("FEEDBACK_ITEM_ID");

    if (!formId || !ratingItemIdValue || !feedbackItemIdValue) {
      throw new Error("Set FORM_ID, RATING_ITEM_ID, and FEEDBACK_ITEM_ID in Script Properties.");
    }

    const ratingItemId = Number(ratingItemIdValue);
    const feedbackItemId = Number(feedbackItemIdValue);
    if (!Number.isInteger(ratingItemId) || !Number.isInteger(feedbackItemId)) {
      throw new Error("The form item IDs must be numeric.");
    }

    const form = FormApp.openById(formId);
    const ratingItem = form.getItemById(ratingItemId);
    const feedbackItem = form.getItemById(feedbackItemId);

    if (!ratingItem || !feedbackItem || ratingItemId === feedbackItemId) {
      throw new Error("The configured form item IDs are invalid.");
    }

    form.createResponse()
      .withItemResponse(createRatingResponse(ratingItem, rating))
      .withItemResponse(createFeedbackResponse(feedbackItem, feedback))
      .submit();

    return jsonResponse({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Feedback submission failed:", errorMessage);
    return jsonResponse({ success: false, error: errorMessage });
  }
}

function createRatingResponse(item, rating) {
  switch (item.getType()) {
    case FormApp.ItemType.SCALE:
      const scaleItem = item.asScaleItem();
      if (rating < scaleItem.getLowerBound() || rating > scaleItem.getUpperBound()) {
        throw new Error("The form rating scale must include values from 1 to 5.");
      }
      return scaleItem.createResponse(rating);
    case FormApp.ItemType.TEXT:
      return item.asTextItem().createResponse(String(rating));
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return item.asMultipleChoiceItem().createResponse(String(rating));
    case FormApp.ItemType.LIST:
      return item.asListItem().createResponse(String(rating));
    default:
      throw new Error("The rating question must be a 1–5 scale, short answer, or single-choice question.");
  }
}

function createFeedbackResponse(item, feedback) {
  switch (item.getType()) {
    case FormApp.ItemType.PARAGRAPH_TEXT:
      return item.asParagraphTextItem().createResponse(feedback);
    case FormApp.ItemType.TEXT:
      return item.asTextItem().createResponse(feedback);
    default:
      throw new Error("The feedback question must be a short-answer or paragraph question.");
  }
}

function jsonResponse(result) {
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function listFeedbackFormItems() {
  const formId = PropertiesService.getScriptProperties().getProperty("FORM_ID");
  if (!formId) {
    throw new Error("Set FORM_ID in Script Properties before listing form items.");
  }

  FormApp.openById(formId).getItems().forEach(function (item) {
    console.log(item.getId() + "\t" + item.getType() + "\t" + item.getTitle());
  });
}
