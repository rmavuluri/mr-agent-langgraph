public async putEventsInFulcrum(eventMessage) {

    let fulcrumEvent;
    let recordMetadata;
  
    try {
  
      // Build Fulcrum Event
      fulcrumEvent = this.getFulcrumEvent(eventMessage);
  
      logger.debug(
        "FULCRUM MSK EVENT",
        JSON.stringify(fulcrumEvent)
      );
  
      // Validate event
      const validationErrors = await validate.validateEvent(fulcrumEvent);
  
      if (validationErrors?.length > 0) {
  
        logger.error(
          "Fulcrum publish validation errors",
          {
            correlationId: fulcrumEvent?.value?.event_correlationId,
            errors: validationErrors
          }
        );
  
        return {
          statusCode: 400,
          body: JSON.stringify(validationErrors)
        };
      }
  
      // Logging event information
      logger.debug(
        "Event Received - event_id:",
        fulcrumEvent?.value?.event_id
      );
  
      logger.info(
        "Event Received - event_correlationId:",
        fulcrumEvent?.value?.event_correlationId
      );
  
      // Send event to MSK (Promise handled with await)
      recordMetadata = await sendEventSync(fulcrumEvent);
  
      if (!recordMetadata) {
        throw new Error("MSK producer returned empty metadata");
      }
  
      logger.debug(
        "recordMetadata",
        JSON.stringify(recordMetadata)
      );
  
      logger.info("Message sent to Fulcrum MSK successfully");
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          metadata: {
            topicName: recordMetadata?.[0]?.topicName,
            partition: recordMetadata?.[0]?.partition,
            offset: recordMetadata?.[0]?.baseOffset,
            key: fulcrumEvent?.metadata?.key
          }
        })
      };
  
    } catch (error) {
  
      logger.error(
        "FULCRUM MSK ERROR",
        {
          message: error?.message,
          correlationId: fulcrumEvent?.value?.event_correlationId,
          stack: error?.stack
        }
      );
  
      return {
        statusCode: 500,
        body: JSON.stringify(
          error,
          Object.getOwnPropertyNames(error)
        )
      };
  
    } finally {
  
      // Ensure producer cleanup always happens
      try {
        sendEvent.cleanupProducer();
      } catch (cleanupError) {
        logger.warn("Producer cleanup failed", cleanupError);
      }
  
    }
  }