
;; creature-racer-admin
;; Administrative subroutines for creature racer contracts

;;
;; =========
;; CONSTANTS
;; =========
;;
(define-constant contract-owner tx-sender)

;;
;; ERROR DEFINITIONS
;;

;; Invocation not allowed in given context (i.e. restricted 
;; to owner)
(define-constant err-forbidden (err u403))
(define-constant err-invalid-arg (err u500))

;; Operator for this contract hasn't been set
(define-constant err-operator-unset (err u1001))

;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;

(define-data-var operator (optional principal) none)
(define-data-var operator-pubkey (optional (buff 33)) none)

;;
;; ================
;; PUBLIC FUNCTIONS
;; ================
;;

;;
;; Assertion which fails unless transaction is initiated
;; by the operator. Should be used in contract functions
;; that can only be called by operator.
(define-read-only (assert-invoked-by-operator)
    (ok (asserts! (is-eq (unwrap! (var-get operator) 
                                  err-operator-unset)
                         tx-sender) err-forbidden)
        )
  )

(define-read-only (get-operator)
    (ok (var-get operator)))

;; TODO: Read only function to verify if operator has
;; signed the request.

;;
;; Used to set new operator account. Operator represents
;; backend service, maintains payout pools and authorizes
;; payouts.
;;
;; Arguments:
;; - new-operator: operator principal
;; - new-pubkey: pubkey of the principal
;;
;; Setting operator to none (a default) will render 
;; operator-dependent features defunct.
;; 
;; For this call to succeed operator and pubkey have to
;; match (or both be none).
;;
;; Security:
;; - can only be called by contract deployer
(define-public (set-operator 
                (new-operator (optional principal))
                (new-pubkey (optional (buff 33))))
    (if (is-eq tx-sender contract-owner)
        (if (is-eq (var-get operator) new-operator)
            (ok false)
            (ok (var-set operator new-operator)))
        err-forbidden))
