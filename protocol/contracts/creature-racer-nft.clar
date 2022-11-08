
;; creature-racer-nft
;; NFT contract for creatures
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;;
;; =========
;; CONSTANTS
;; =========
;;
(define-constant contract-owner tx-sender)


(define-constant err-forbidden (err u403))
(define-constant err-not-found (err u404))

;;
;; ==================
;; DATA MAPS AND VARS
;; ==================
;;

(define-non-fungible-token creature-racer-creature-nft uint)

;; TODO: buffer lengths need revisiting / confirming)
(define-map free-mint principal bool)
(define-map creature-keys uint (buff 256))
(define-map creature-supply  (buff 256) uint)
(define-map creature-expiry-time uint uint)

(define-map royalties uint uint)
(define-map first-owner uint principal)

(define-data-var operator (optional principal) none)

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

;; TODO: Instead of 5 1-byte buffers consider single 5-byte
;; buffer?
(define-public (mint (nft-id uint)
                     (type-id (buff 1))
                     (part1 (buff 1))
                     (part2 (buff 1))
                     (part3 (buff 1))
                     (part4 (buff 1))
                     (part5 (buff 1))
                     (expiry uint)
                     (price uint)
                     (signature (buff 64)))
    (err u666) ;; TODO - implement
  )


;; NOTE: Solidity "mintManyNFTCreatures" not compatible with Calrity,
;; thus not going to be implemented.


(define-read-only (is-expired (nft-id uint))
    (let ((creature-expiry (unwrap! (map-get? creature-expiry-time nft-id)
                                    err-not-found)))
      (ok (< creature-expiry block-height))
      )
)

(define-read-only (get-creature-data (nft-id uint))
    (err u666) ;; TODO - implement
)

(define-read-only (get-mint-cap (part1 (buff 1))
                                (part2 (buff 1))
                                (part3 (buff 1))
                                (part4 (buff 1))
                                (part5 (buff 1)))
    (err u666) ;; TODO - implement
  )

(define-read-only (get-first-owner (nft-id uint))
    (ok (unwrap! (map-get? first-owner nft-id) err-not-found)))


(define-public (set-royalty (nft-id uint) 
                            (percentage-points uint))
    (let (
          (owner (try! (get-first-owner nft-id)))
          )
      (asserts! (is-eq owner tx-sender) err-forbidden)
      (ok (map-set royalties nft-id percentage-points))
      )
)

(define-read-only (royalty-info (nft-id uint) 
                                (sale-price uint))
    (let (
          (owner (try! (get-first-owner nft-id)))
          (royalty (unwrap! (map-get? royalties nft-id) 
                            err-not-found))
          )
      (ok { owner: owner, royalty: (/ (* sale-price royalty) u10000) })
      )
)


(define-public (change-operator (new-operator principal))
    (let (
          (prev-operator (var-get operator))
          )
      (asserts! (is-eq contract-owner tx-sender)
                err-forbidden)
      (var-set operator (some new-operator))
      (ok prev-operator)
      )
  )

;;
;; Functions required by nft-trait
;; -------------------------------
;;

(define-read-only (get-last-token-id)
    (err u666)) ;; TODO: needs implementation

(define-read-only (get-token-uri (token-id uint))
    (ok none)) ;; TODO: implement

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? creature-racer-creature-nft token-id))
  )

(define-public (transfer (token-id uint) (sender principal)
                         (recipient principal))
    (begin
     (asserts! (is-eq tx-sender sender) err-forbidden)
     (nft-transfer? creature-racer-creature-nft
                    token-id
                    sender
                    recipient)
     )
  )
