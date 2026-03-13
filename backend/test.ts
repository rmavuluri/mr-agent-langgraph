public async putEventsInFulcrum(eventMessage) {

    let fulcrumEvent;
    let recordMetadata;
  
    try {
  
      // Build event
      fulcrumEvent = this.getFulcrumEvent(eventMessage);
  
      logger.debug(
        "FULCRUM MSK TEST EVENT",
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
          body: validationErrors
        };
      }
  
      // Event received logs
      logger.debug(
        "Event Received - event_id:",
        fulcrumEvent?.value?.event_id
      );
  
      logger.info(
        "Event Received - event_correlationId:",
        fulcrumEvent?.value?.event_correlationId
      );
  
      // Send event to MSK
      recordMetadata = await sendEventSync(fulcrumEvent);
  
      logger.debug(
        "recordMetadata",
        JSON.stringify(recordMetadata)
      );
  
      logger.info("Message sent to Fulcrum MSK successfully");
  
      return {
        statusCode: 200,
        metadata: {
          topicName: recordMetadata?.[0]?.topicName,
          partition: recordMetadata?.[0]?.partition,
          offset: recordMetadata?.[0]?.baseOffset,
          key: fulcrumEvent?.metadata?.key
        }
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
  
      // Always cleanup producer
      try {
        sendEvent.cleanupProducer();
      } catch (cleanupError) {
        logger.warn("Producer cleanup failed", cleanupError);
      }
  
    }
  }