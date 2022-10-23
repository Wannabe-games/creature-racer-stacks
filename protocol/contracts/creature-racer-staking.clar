
;; creature-racer-staking
;; Contract for staking creature NFT tokens


;;
;; =========
;; CONSTANTS
;; =========
;;

(define-constant err-forbidden (err u403))
(define-constant contract-owner tx-sender)

;; Error definitions
;; -----------------
(define-constant err-operator-unset (err u1001))

;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;
(define-map user-position principal uint)
(define-map staked-creatures uint uint)
;; TODO: creature staking cycle indirection

(define-data-var operator (optional principal) none)

;;
;; =================
;; PRIVATE FUNCTIONS
;; =================
;;
(define-private (assert-invoked-by-operator)
    (ok (asserts! (is-eq (unwrap! (var-get operator) 
                                  err-operator-unset)
                         tx-sender) err-forbidden)
        )
  )

;;
;; ================
;; PUBLIC FUNCTIONS
;; ================
;;
(define-public (enter-staking (nft-id uint))
    (err u666) ;; TODO: implement
  )

(define-public (leave-staking (nft-id uint))
    (err u666) ;; TODO: implement
  )

(define-public (open-new-cycle)
    (begin
     (try! (assert-invoked-by-operator))
     (err u666)
     )
)

(define-public (remove-expired-creature (user principal)
                                        (nft-id uint))
    (assert-invoked-by-operator) ;; TODO: implement
  )

(define-read-only (is-creature-locked (user principal)
                                      (nft-id uint))
    (ok false) ;; TODO: implement
  )

(define-read-only (get-user-share (user principal))
    (ok u0) ;; TODO: implement
  )

(define-read-only (get-total-share)
    (ok u0) ;; TODO: implement
  )


