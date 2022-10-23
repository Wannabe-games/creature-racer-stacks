
;; creature-racer-referral-pool
;; Referral pool contract

;;
;; =========
;; CONSTANTS
;; =========
;;
(define-constant contract-owner tx-sender)

;; Error definitions
;; -----------------
(define-constant err-user-not-found (err u404))
(define-constant err-operator-unset (err u1001))

;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;

(define-data-var operator (optional principal) none)


(define-map withdrawal-counters principal uint)

;; private functions
;;

;;
;; ================
;; PUBLIC FUNCTIONS
;; ================
;;

;; Get number of withdrawals of given user
(define-read-only (get-withdrawal-count (user principal))
    (let (
          (count (unwrap! (map-get? withdrawal-counters
                                    user)
                          err-user-not-found))
          )
      (ok count)
      )
)


;; get balance of the pool
(define-read-only (get-balance)
    (stx-get-balance (as-contract tx-sender)))


;; Withdraw funds from pool to sender address.
;; amount - amount to withdraw
;; withdrawal-count - checksum for withdrawals
;; backend-sig - backend signature on the request hash
(define-public (withdraw (amount uint)
                         (withdrawal-count uint)
                         (backend-sig (buff 64)))
    ;; FIXME: need to differentiate between owner and backend
    (ok u0)
)

;; TODO: consider factoring this concept out to dedicated
;; contract.
(define-public (change-operator (new-operator principal))
    (let ((old var-get operator))
      (asserts! (is-eq tx-sender contract-owner) err-forbidden)
      (var-set operator (some new-operator))
      (ok old)
      )
  )
