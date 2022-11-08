
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
(define-constant err-forbidden (err u403))
(define-constant err-user-not-found (err u404))

;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;



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
;; *-sig - argument signature issued by backend
;; This function can be called by sender who wants to withdraw 
;; funds from the pool. Signatures issued by operator's private
;; key need to be passed  
(define-public (withdraw (amount uint)
                         (amount-sig (buff 65))
                         (withdrawal-count uint)
                         (withdrawal-count-sig (buff 65))
                         (sender-sig (buff 65))
                         (sender-pubkey (buff 33)))
    (ok u0) ;; TODO: needs implementation
)
