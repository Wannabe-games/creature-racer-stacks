
;; creature-racer-payment
;; payment deposit contact. Each payment is split to operator
;; wallet,  raward pool and referral pool

;; 
;; =========
;; CONSTANTS
;; =========
;;

;; contract-owner: whoever deployed the contract. It's the only
;;                 principal allowed to change other roles.
(define-constant contract-owner tx-sender)


;; Error definitions
;; -----------------

(define-constant err-forbidden (err u403))
(define-constant err-operator-unset (err u1001))
(define-constant err-insufficient-amount (err u2001))


;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;

;; Principals / wallets
;; --------------------

;; Contract operator
(define-data-var operator (optional principal) none)
;; Address of principal which is currently supported by this contract
(define-data-var supported-wallet (optional principal) none)


;; Deposit split
;; -------------

;; operator's share in every deposit, defaults
;; to 100uSTX
(define-data-var portion-for-operator uint u100)

;; percent of stx to be transferred to supported wallet
(define-data-var percent-for-supported-wallet uint u0)

;;
;; =================
;; PRIVATE FUNCTIONS
;; =================
;;

;;
;; ================
;; PUBLIC FUNCTIONS
;; ================
;;


;; Receive (deposit) funds
;; -----------------------
;; Arguments:
;;  amount-ustx: amount of microSTX to be transferred
;; Returns:
;;  TODO
(define-public (receive-funds (amount-ustx uint))
    (let (
          (operator-principal (unwrap! (var-get operator) err-operator-unset))
          (operator-income (var-get portion-for-operator))
          )
      (asserts! (> amount-ustx operator-income) err-insufficient-amount)
      (ok u0) ;; TODO: implement fund allocation logic
      )
)

;; Update operator principal
;; -------------------------
;; Arguments:
;;  new-operator: principal to become new operator for this contract
;; Returns:
;;  (result (optional principal) uint): previous operator (if any)
(define-public (change-operator (new-operator principal))
    (let ((old (var-get operator)))
     (asserts! (is-eq tx-sender contract-owner) err-forbidden)
     (var-set operator (some new-operator))
     (ok old)
     )
)


;; Set portion for operator
;; ------------------------
;; Set amount of microSTX to be transferred to operator's wallet from
;; each receive-funds amount.
;; 
;; Arguments:
;;  amount: microSTX to be deducted from each payment and transferred
;;          to operator account.
;; Returns:
;;  (result uint uint): previous value
(define-public (set-portion-for-operator (amount uint))
    (let ((old-portion (var-get portion-for-operator)))
      (asserts! (is-eq tx-sender contract-owner) err-forbidden)
      (var-set portion-for-operator amount)
      (ok old-portion)
      )
)

;; Change / reset supported principal
;; ----------------------------------
;; Returns:
;; (result (optional principal) uint) principal of previous supported wallet
(define-public (change-supported-wallet (new-supported (optional principal)))
    (let ((old-wallet (var-get supported-wallet)))
      (asserts! (is-eq tx-sender contract-owner) err-forbidden)
      (var-set supported-wallet new-supported)
      (ok old-wallet)
      )
)


