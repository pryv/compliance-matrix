# Encrypted off-host backups: the transfer and processor questions

Your encrypted backups go to a bucket in another country, and the
storage provider never holds the key. Is that a transfer? Is the
provider a processor? Encryption changes the security posture (what
the provider can read, what a leak of the bucket means); it does not
by itself remove either question. This note separates the two, says
what Pryv's backup encryption covers, and lists what stays with you.
It records guidance and facts about the software; it is not legal
advice, and your counsel decides the classification of your setup.

Checked 2026-11-25 against open-pryv.io master `cbdbe2ad` and the
sources listed at the end.

## Is it a transfer (GDPR Chapter V)?

EDPB Guidelines 05/2021 (paragraph 9) use three cumulative criteria:
an exporter subject to the GDPR for the processing, data disclosed or
made available to another controller or processor, and that importer
being in a third country. Paragraph 16 names storage in a cloud
outside the EEA offered by a service provider as a transfer when the
three are met. None of the three asks whether the data is readable by
the importer.

| Your destination | Reading under the guidelines | What to do |
|---|---|---|
| A provider's bucket outside the EEA | Transfer, encrypted or not | Chapter V basis: an adequacy decision (Art.45) or an Art.46 tool with its assessment; supplementary measures where the assessment calls for them |
| A provider established in the EEA, data kept in the EEA | No transfer by the storage itself. Check the contract: remote access from a third country by another controller or processor, support included, is a transfer (paragraph 16) | Art.28 contract naming location and remote access |
| A provider in the EEA whose parent is subject to third-country law | No transfer by the storage itself (Example 12); a disclosure to a third-country authority would be one | Art.28(1): assess the provider's guarantees before engaging it |
| Your own hardware abroad, no other controller or processor involved | Not a Chapter V transfer (paragraph 17, "internal processing"). Another company of your group can count as another party (Example 9) | The rest of the GDPR still applies, Art.32 and the local law included |

Where the criteria are met, encryption with your own key is a
**supplementary measure on top of** the transfer basis, not a
substitute for one. EDPB Recommendations 01/2020, Use Case 1
(paragraph 84) is exactly this case, storage for backup purposes in a
third country, and treats the encryption as an effective supplementary
measure if **all six** of its conditions hold. Paragraph 83 adds that
the same measure can be required under Art.25 and Art.32 where the
destination has an adequacy decision, or inside the EEA.

## Is the provider a processor (GDPR Art.28)?

Yes, in the EDPB's reading. Guidelines 07/2020 (example "Hosting
services", paragraph 40) take a hosting service that only stores
encrypted data, without knowing whether it is personal data: storage
is a processing activity, so the host is a processor and an Art.28
agreement must be concluded. If you run Pryv for a controller, you
are the processor and the storage provider is your sub-processor: its
engagement needs the controller's authorisation and the same
obligations passed on (Art.28(2) and (4)).

**The argument that ciphertext is not personal data for the provider.**
The Court of Justice held on 4 September 2025 (C-413/23 P, *EDPS v
SRB*) that whether pseudonymised data is personal depends on the
means reasonably available to the person holding it. The case concerned
pseudonymised comments sent to a recipient under Regulation 2018/1725,
not encrypted storage, and the data stayed personal for the controller
that held the key to re-identification (paragraph 76). Do not plan on
it to drop the contract, the register entry or the transfer basis
without counsel's written advice.

## What Pryv's encryption covers, and what stays visible

`bin/backup.js` with a key (`--recipient-pubkey` or a passphrase; see
the `backup-payload-encryption` primitive) encrypts each file with
AES-256-GCM before it is written, so the copy to your bucket is
ciphertext. Pryv writes to a directory: the upload, its credential and
the bucket are yours. Encryption is opt-in: without a key the files
are plaintext, which the backup announces on stderr (`[BKPW1]`).

An encrypted backup still shows whoever can list the bucket:

- the user ids, as directory names (`users/<userId>/`) and in
  `chain.json`, which also gives each run's date, scope, core version
  and accounts, so accounts appearing and disappearing between runs
  are visible;
- the identifier of each attachment (its file name), the number and
  size of the files, hence the growth of each account;
- crypto headers (`encryption.json`, file headers, `manifest.sig`),
  `RESTORE-README.md` and the decrypt script.

It does not show usernames, account fields, events, accesses, audit
rows, attachment content or the manifest: those are encrypted. A user
id is an opaque identifier, and you can resolve it: for you it is
personal data. If this surface matters, put the directory into an
encrypted archive of your own before the upload.

Two contents to know when you describe the copy in a register: a
whole-core backup (no `--user`) carries the platform's unique and
indexed account-field rows **for every core of the cluster**, not only
the core backed up, as they are stored: usernames and unique values are
keyed hashes with `platform.piiMode: hashed` (the default), in clear
otherwise, and indexed values are as given (see `context/cross-border-platformdb-implications.md`,
Tier 1), and the per-user files carry access tokens, webhook signing
secrets and encrypted second-factor secrets (see
`context/operator-backup-coverage.md`).

### Use Case 1 conditions, one by one

| Condition (paragraph 84) | Pryv's part | Your part |
|---|---|---|
| 1. Strong encryption before transmission, importer identity verified | Files are encrypted before they reach the destination directory | Enable it; authenticate the storage endpoint at upload |
| 2. State-of-the-art algorithm and parameters | AES-256-GCM, one subkey per file (HKDF-SHA256); data key wrapped with RSA-OAEP SHA-256, or derived with scrypt (N = 2^17 since 2.0.0-rc.86) | RSA key size (the operator page uses 3072 bits) or passphrase strength: Pryv checks neither |
| 3. Strength fits the time the data must stay confidential | - | Footnote 81 names public-key algorithms as the concern over time, and the recipient-key model wraps the data key with RSA: shorten the retention, or add a layer, if the data must stay confidential for decades |
| 4. Correct implementation, verified, maintained, no known vulnerability | Open source, on Node.js `crypto`, tested (`[BKAD1]` to `[BKAD6]`, `[BKSM1]` to `[BKSM5]`); **not certified** | Keep Pryv and Node.js up to date; record the assessment |
| 5. Keys reliably managed | Recipient-key model: the backup host holds no secret that decrypts its own output | Generation, custody, rotation, revocation. A lost key makes the backup unrecoverable |
| 6. Keys solely under the exporter's control, or held by a trusted entity in the EEA or an equivalent jurisdiction | The private key is never needed to take or continue a backup | Keep the private key, and the place where you decrypt, out of the provider's reach. With a passphrase, the core's host holds it: a provider that runs both the core and the bucket is not cut off from the key |

The same limit holds one level up: if one provider runs your core and
stores its backups, encrypting the backups does nothing about its
access to the running core. Use Case 6 (paragraphs 94 and 95) is the
EDPB's reading of processing in the clear, and it is not the backup
case.

## What you still owe

- **Transfer basis** (Art.44 to 46) for the destination, with the
  assessment and the Use Case 1 answers on file.
- **Contract** (Art.28(3)) with the storage provider: instructions,
  location, deletion, breach notice. Keep the provider's sub-processors
  and support locations with it.
- **Records** (Art.30(1)): recipient (d), third country (e), retention
  (f), security measures (g). **Notice** (Art.13(1)(e) and (f),
  13(2)(a)): recipients, the transfer and its safeguard, the retention
  period. `access.clientData.transfer_basis` records transfers bound
  to an access; a backup has none, so this one lives in your register.
- **Retention that matches your erasure promises.** Pryv neither
  uploads nor expires backups. Each run has one data key, so one
  account cannot be made unreadable alone in a kept run; deleting its
  files from the copy makes a restore refuse that run (2.0.0-rc.86
  onward, `[BKSM2]`), and removing a run from the middle of a chain
  makes it refuse the chain (`[BKC7]`): retire whole chains, and state
  the delay. A write-only or locked bucket has the same effect. A restore refuses an account
  erased after the backup while the erasure ledger holds its record
  (since 2.0.0-rc.89, `[ERLR1]`); set
  `accountErasure.ledger.retentionDays` at least as long as your
  oldest copy. See the backup paragraphs of `gdpr.Art.17`.
- **Authenticity of the copy.** Encryption to a public key does not
  prove who wrote the backup: sign the runs (`--signing-key`, and
  `--signing-pubkey` at restore, `[BKSM4]`) and protect write access
  to the bucket.
- **Restore tests** (Art.32(1)(c) and (d)), from the off-host copy and
  with the offline key. Restoring on a machine in a third country
  decrypts the data there: choose its location like the bucket's.

## What encryption does change

- **Breach posture.** A leak of the bucket alone exposes ciphertext
  and the visible surface above. Art.34(3)(a) lists encryption among
  the measures that can make communication to the data subjects
  unnecessary, and the risk assessment of Art.33(1) weighs it. The
  assessment is yours and depends on the key not having leaked too.
- **Security of processing.** Art.32(1)(a) names encryption among the
  measures.
- **What the provider, or an authority addressing it, can read**: the
  visible surface, no content, as long as condition 6 holds.

## Sources

- Regulation (EU) 2016/679, Art.13, 28, 30, 32, 33, 34, 44 to 46.
- [EDPB Recommendations 01/2020](https://www.edpb.europa.eu/system/files/2021-06/edpb_recommendations_202001vo.2.0_supplementarymeasurestransferstools_en.pdf)
  on supplementary measures, version 2.0, 18 June 2021, paragraphs 13,
  83, 84 (Use Case 1), 94 and 95 (Use Case 6).
- [EDPB Guidelines 05/2021](https://www.edpb.europa.eu/system/files/2023-02/edpb_guidelines_05-2021_interplay_between_the_application_of_art3-chapter_v_of_the_gdpr_v2_en_0.pdf)
  on Art.3 and Chapter V, version 2.0, 14 February 2023, paragraphs 9,
  16 and 17, Examples 9 and 12.
- [EDPB Guidelines 07/2020](https://www.edpb.europa.eu/system/files/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf)
  on controller and processor, version 2.1, example "Hosting services".
- Judgment of 4 September 2025, *EDPS v SRB*, C-413/23 P, paragraphs
  76, 77 and 86.

## Matrix encoding

- `gdpr.Art.44` detail: off-host backup paragraph (and the overview
  sentence on EU hosting now names backups).
- `gdpr.Art.28` detail: the backup destination as a processor
  relationship outside the opt-in integration table.
- `iso-27001.A.8.13`: offsite copies paragraph.
- FAQ Q35. No tier change, no `planned:` chip.

## See also

- `context/cross-border-platformdb-implications.md`: the same
  reasoning for live PlatformDB replication.
- `context/subprocessor-posture-and-data-flow.md`: who your processors
  are, and which ones Pryv cannot name for you.
- `context/operator-backup-coverage.md`: what a backup holds, integrity
  and signatures.
- `context/data-retention-operator-owned.md`: retention on your side.
