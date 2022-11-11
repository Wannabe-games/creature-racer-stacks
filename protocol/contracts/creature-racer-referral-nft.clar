
;; creature-racer-referral-nft
;; wannabe rNFT contract for creature racer
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;;
;; =========
;; CONSTANTS
;; =========
;;

;; Contract owner
(define-constant contract-owner tx-sender)

;;
;; ERROR DEFINITIONS
;;


;; referral code was already used to mint rNFT
(define-constant err-refcode-used (err u3001))

;; user address already has an rNFT
(define-constant err-rnft-already-granted (err u3002))

;; referral already has fixed bonus
(define-constant err-has-fixed-bonus (err u3003))

;; only first owner of rNFT can perform this action
(define-constant err-only-first-owner (err u3004))

;; referral code too length error
(define-constant err-invalid-length (err u3005))

;; user not allowed to perform transfer
(define-constant err-forbidden (err u403))


;; asset not found
(define-constant err-not-found (err u404))
;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;
(define-non-fungible-token creature-racer-referral-nft uint)
(define-data-var last-token-id uint u0)

;; maps invited user address to token id
(define-map invitees principal uint)

;; first owner of minted token
(define-map first-owner uint principal)

;; tracking amount of rnfts owned by user
(define-map rnft-count principal uint)

;; maps token id to referral code
(define-map token-ids uint (string-utf8 150))
(define-map ref-codes (string-utf8 150) uint)

;; invitations counter
(define-map invitations uint uint)

;; token-id => if token has fixed bonus
(define-map has-fixed-referral-bonus uint bool)


(define-map royalties uint uint)

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
;;
;; Functions required by nft-trait
;;

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
  )

(define-read-only (get-token-uri (token-id uint))
  ;; NFT URI is not supported by this contract
  (ok none)
  )

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? creature-racer-referral-nft token-id))
  )

(define-public (transfer (token-id uint) (sender principal)
                         (recipient principal))
  (begin
   (asserts! (is-eq tx-sender sender) err-forbidden)
   (try! (nft-transfer? creature-racer-referral-nft
                        token-id
                        sender
                        recipient))
   (map-set rnft-count sender 
            (- (unwrap-panic (map-get? rnft-count sender))
                             u1))
   (ok (map-set rnft-count recipient
                (match (map-get? rnft-count recipient)
                       val (+ val u1)
                       u1))
       )
                        
   )
  )

;;
;; rNFT public interface
;;
(define-public (mint (recipient principal)
                     (refcode (string-utf8 150))) 
    (let (
          (your-token-id (+ (var-get last-token-id) u1))
          )
      (try! (contract-call? .creature-racer-admin
                            assert-invoked-by-operator))
      (asserts! (> (len refcode) u3) err-invalid-length)
      (if (is-none (map-get? ref-codes refcode))
          (if (map-insert rnft-count recipient u1)
              (begin
               (map-insert first-owner your-token-id recipient)
               (map-insert ref-codes refcode your-token-id)
               (ok your-token-id)
               ) err-rnft-already-granted)
          err-refcode-used)
      )
  )

(define-read-only (get-first-owner (token-id uint))
    (match (map-get? first-owner token-id)
           val (ok val)
           err-not-found)
  )

;;
;; Arguments: refcode - ascii string[12]
;; Returns: (result uint uint) number of invitations on success
(define-read-only (get-invitations-by-ref-code (refcode (string-utf8 150)))
    (let (
          (token-id (unwrap! (get-token-id refcode) err-not-found))
          )
      (ok (unwrap! (map-get? invitations token-id) err-not-found))
      )
  )

(define-read-only (get-invitations-by-invitee (invitee principal))
    (let (
          (token-id (unwrap! (map-get? invitees invitee)
                             err-not-found))
          )
      (ok (unwrap! (map-get? invitations token-id)
                   err-not-found))
      )
  )

(define-read-only (get-token-id (refcode (string-utf8 150)))
    (match (map-get? ref-codes refcode)
           val (ok val)
           err-not-found)
  )

(define-read-only (get-percentage-of-reward-bps (invitee principal))
    (let (
          (ninv (match (get-invitations-by-invitee invitee)
                       val val not-found u0))
          )
      (ok (if (>= ninv u1501) u4000
              (if (>= ninv u500) u2000
                  (if (>= ninv u75) u1000
                      (if (>= ninv u25) u500
                          (if (>= ninv u1) u100
                              u0)
                          )
                      )
                  )
              )
          )
      )
  )

(define-public (set-referral-to-receiving-fixed-bonus 
                (refcode (string-utf8 150)))
    (let (
          (token-id (try! (get-token-id refcode)))
          )
      (try! (contract-call? .creature-racer-admin
                            assert-invoked-by-operator))
      (if (map-insert has-fixed-referral-bonus token-id true)
          (ok true)
          err-has-fixed-bonus))
  )


(define-public (increment-invitations (refcode (string-utf8 150))
                                      (invitee principal))
    (let (
          (token-id (try! (get-token-id refcode)))
          )
     (try! (contract-call? .creature-racer-admin
                           assert-invoked-by-operator))
     (map-set invitees invitee token-id)
     (ok (map-set invitations token-id
                  (match (map-get? invitations token-id)
                         cnt (+ cnt u1)
                         u1)
                  ))
     )
  )

(define-public (set-royalty (token-id uint)
                            (percentage-basis-points uint))
    (let (
          (owner (unwrap! (get-first-owner token-id)
                          err-not-found))
          )
      (asserts! (is-eq owner tx-sender) err-only-first-owner)
      (ok (map-set royalties token-id percentage-basis-points))
      )
  )


(define-read-only (royalty-info (token-id uint)
                                (sale-price uint))
    (let (
          (owner (unwrap! (get-first-owner token-id)
                          err-not-found))
          (royalty (unwrap! (map-get? royalties
                                      token-id)
                            err-not-found))
          )
      (ok { amount: (/ (* sale-price royalty) u10000),
          receiver: owner })
      )
  )
