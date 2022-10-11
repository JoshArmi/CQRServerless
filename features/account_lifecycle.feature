Feature: Managing the account lifecycle

    Scenario: Registering a new user
        Given a user "Jane Doe"
        When she registers
        Then her account is created
