
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

;; Invocation not allowed in given context (i.e. restricted 
;; to owner)
(define-constant err-forbidden (err u403)) 

;; referral code was already used to mint rNFT
(define-constant err-refcode-used (err u3001))

;; user address already has an rNFT
(define-constant err-rnft-already-granted (err u3002))


;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;
(define-non-fungible-token creature-racer-referral-nft uint)
(define-data-var last-token-id uint u0)

;; maps user address to token id
(define-map user-tokens principal uint)

;; maps token id to referral code
(define-map token-ids uint (string-ascii 12))
(define-map ref-codes (string-ascii 12) principal)

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

(define-read-only (get-invitations-by-invitee (invitee principal))
  (ok u0)) ;; TODO: needs implementation

(define-read-only (get-token-id (refcode (string-ascii 12)))
  (ok u0)) ;; TODO: needs implementation

(define-read-only (get-percentage-of-reward-bps (invitee principal))
  (ok u0)) ;; TODO: needs implementation


                                              

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
   (nft-transfer? creature-racer-referral-nft
                  token-id
                  sender
                  recipient)
   )
  )

;;
;; rNFT public interface
;;
(define-public (mint (recipient principal)
                     (refcode (string-ascii 12))) 
  (let (
        (your-token-id (+ (var-get last-token-id) u1))
        )
    (asserts! (is-eq tx-sender contract-owner) err-forbidden)
    (if (is-none (map-get? ref-codes refcode))
        (if (is-none (map-get? user-tokens recipient))
            (begin
             (map-insert user-tokens recipient your-token-id)
             (map-insert ref-codes refcode recipient)
             (ok your-token-id)
             ) err-rnft-already-granted)
      err-refcode-used)
      )
  )

