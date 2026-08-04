package com.zidio.keystone.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> baseBody(HttpStatus status, String message) {

        Map<String, Object> body = new HashMap<>();

        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);

        return body;
    }


    @ExceptionHandler(ApiExceptions.NotFoundException.class)
    public ResponseEntity<Object> handleNotFound(ApiExceptions.NotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(baseBody(
                        HttpStatus.NOT_FOUND,
                        ex.getMessage()
                ));
    }


    @ExceptionHandler(ApiExceptions.IllegalTransitionException.class)
    public ResponseEntity<Object> handleIllegalTransition(
            ApiExceptions.IllegalTransitionException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(baseBody(
                        HttpStatus.CONFLICT,
                        ex.getMessage()
                ));
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(baseBody(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username or password"
                ));
    }


    @ExceptionHandler({
            ApiExceptions.ForbiddenException.class,
            AccessDeniedException.class
    })
    public ResponseEntity<Object> handleForbidden(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(baseBody(
                        HttpStatus.FORBIDDEN,
                        ex.getMessage()
                ));
    }


    @ExceptionHandler(ApiExceptions.ValidationException.class)
    public ResponseEntity<Object> handleValidation(
            ApiExceptions.ValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(baseBody(
                        HttpStatus.BAD_REQUEST,
                        ex.getMessage()
                ));
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleBeanValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );


        Map<String, Object> body =
                baseBody(
                        HttpStatus.BAD_REQUEST,
                        "Validation failed"
                );

        body.put("fieldErrors", errors);


        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }



    // IMPORTANT: Shows real error in Railway logs
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex) {

        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        baseBody(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                ex.getMessage() != null
                                        ? ex.getMessage()
                                        : "Unexpected error occurred"
                        )
                );
    }
}