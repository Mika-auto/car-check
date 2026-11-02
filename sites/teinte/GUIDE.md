# Guide d'adaptation : moteur de site vitrine

Ce dossier contient un site complet en **un seul fichier** (`index.html`) : accueil, catalogue, réservation d'ateliers, journal, contact, panier.
Le site de démonstration s'appelle **Teinte** (pigments naturels, maison fictive). Il sert de modèle.

Le fichier est découpé en trois parties :

| Partie | Où | À modifier pour un client ? |
|---|---|---|
| Styles (`<style>`) | haut du fichier | Rarement. Les couleurs et polices viennent de `SITE.theme`. |
| **`SITE`** (contenu) | début du `<script>`, bloc « 1. CONTENU DU SITE » | **Oui, c'est le seul endroit à changer.** |
| Moteur | blocs « 2 », « 3 », « 4 » du script | Non, sauf pour ajouter un module. |

---

## 1. Les étapes pour un nouveau client

1. Copier le dossier : `sites/teinte` → `sites/<nom-client>`.
2. Remplir le **brief client** (section 4) avec le client.
3. Remplacer les valeurs de `SITE` champ par champ (section 2).
4. Changer le `<title>` en haut du fichier (2 à 4 mots, le nom du client).
5. Ouvrir la page, vérifier sur ordinateur et téléphone, puis publier.

Aucune compilation n'est nécessaire, et il n'y a aucune dépendance en dehors de Google Fonts.

---

## 2. Référence des champs de `SITE`

### `brand` : identité et coordonnées
- `name` : nom court (logo, titre des onglets, référence de réservation).
- `legal` : raison sociale, affichée dans le pied de page.
- `baseline`, `place`, `since` : accroche, ville et année de création.
- `email`, `phone`, `address` (tableau de lignes).
- `hours` : horaires par jour (`0` = dimanche … `6` = samedi), sous la forme `[ouverture, fermeture]` en heures, ou `null` si fermé. Ils alimentent l'indicateur « ouvert / fermé » en direct dans l'en-tête et le tableau de la page Contact.
- `demoNotice` : mention affichée sous les formulaires. Pour un vrai site, remplacer le texte et brancher les formulaires (section 5).

### `theme` : identité visuelle
- `paper`, `paper2` : fond principal et fond secondaire.
- `ink` : couleur du texte. Elle doit garder un contraste d'au moins 7:1 avec `paper`.
- `muted` : texte secondaire, avec un contraste d'au moins 4,5:1 sur `paper`.
- `line` : couleur des filets.
- `accent` : couleur signature (boutons, liens actifs, transitions de page). Le texte posé dessus passe automatiquement en noir ou en blanc selon la clarté de l'accent.
- `fontsUrl`, `fontUi`, `fontText` : URL Google Fonts et noms des deux familles. `fontUi` sert aux titres et à l'interface, `fontText` aux textes longs.
  **Règle de lisibilité** : éviter les polices à empattements filiformes (Didot, Bodoni) pour les titres. Préférer une police à traits épais : une grotesque large ou une serif robuste.

### `hero` : première impression
- `word` : le mot dessiné en grains de couleur. 4 à 8 lettres en majuscules donnent le meilleur rendu.
- `kicker` : 3 courtes mentions au-dessus du mot.
- `title` : la promesse principale. On peut mettre un mot en valeur avec `<mark>mot</mark>`.
- `text`, `ctas` (boutons : `label`, `href` vers une page ou une section, `style` `accent` ou `ghost`), `hint`.
- `particleColors` : 6 à 8 couleurs, **ordonnées comme un dégradé**, pour que le mot ressemble à une matière (pierre, bois, tissu, café…).

### `manifesto`
Un paragraphe de 40 à 70 mots. Il s'allume mot à mot pendant la lecture. Les mots listés dans `highlights` sont soulignés à la couleur d'accent.

### `quarry` : l'illustration en coupe
Des couches de couleur superposées en parallaxe (`layers` : `name`, `hex`, `depth`). À adapter au métier du client : les couches d'un sol pour un vigneron, les strates d'un gâteau pour un pâtissier, les étapes d'une infusion pour un torréfacteur.

### `process` : les cartes empilées
5 étapes au maximum. Chaque étape a un verbe, un **chiffre réel avec son unité** (`value` + `unit` + `fact`), un texte, deux couleurs pour l'image, une couleur de fond (`bg`) et une couleur de texte (`ink`). Vérifier le contraste entre les deux.

### `mixer` : le module interactif
Le nuancier mélange jusqu'à 3 produits par soustraction de la lumière et peut repeindre le site en direct.
`defaults` donne le mélange affiché à l'ouverture. Pour un client sans notion de couleur, on peut retirer la section (section 3) ou la détourner : un assemblage de cafés ou de thés, un choix de teinte de bois, la palette d'une marque.

### `stats`
4 chiffres clés (`value` est un nombre, `suffix` un texte facultatif comme « ans »). Ils s'animent en comptant à leur apparition.

### `families` et `products` : le catalogue
- `families` : les filtres du catalogue.
- Chaque produit a les champs `id` (unique, sans espace), `name`, `family`, `ci` (référence technique affichée en badge), `hex` (couleur de l'image générée), `origin`, `price`, `opacity` et `light` (0 à 3), puis `text`.
  Pour un autre métier, `ci` peut devenir une référence, un millésime ou un format. Les libellés de la fiche se changent dans la fonction `drawPig`.
- `currency`, `unit` : devise et conditionnement affichés.
- `shipping` : seuil de livraison offerte et frais de port.

### `testimonials`, `workshops`, `journal`, `faq`
- `workshops` : `weekday` (0 à 6) et `hour` génèrent automatiquement les 4 prochaines dates. `capacity` donne le nombre de places.
- `journal` : chaque article a un `id` (son adresse sera `#lire-<id>`) et un `body` composé de blocs `['p', texte]` (paragraphe), `['q', texte]` (citation) ou `['h', texte]` (intertitre).
- `faq` : paires `[question, réponse]`.

---

## 3. Ajouter ou retirer une page ou une section

- **Pages** : la liste `nav` pilote le menu et le routage (`#accueil`, `#pigments`…). Pour retirer une page, supprimer son entrée dans `nav` et l'appel `renderXxx()` correspondant dans `boot()`.
- **Sections de l'accueil** : elles sont écrites dans `renderHome()`. Chaque section est un bloc `<div class="…">` facile à supprimer ou à déplacer.
- **Images** : toutes les « photos » sont générées dans le navigateur (tas de poudre, matières, coupe de falaise). Pour utiliser de vraies photos, remplacer l'appel `powder(...)` dans `src="..."` par le chemin de l'image.

---

## 4. Brief client (à remplir en rendez-vous)

1. Nom, activité en une phrase, ville, année de création.
2. Les **trois mots** que le client veut que l'on retienne.
3. Le mot à dessiner en grains, et la matière qu'il doit évoquer.
4. Une couleur signature et deux couleurs secondaires (ou une photo de la matière).
5. L'histoire en un paragraphe : d'où viennent les produits, ce qui les rend différents.
6. Les étapes de fabrication (3 à 5), avec un **chiffre vrai** pour chacune (une température, une durée, une distance, un pourcentage).
7. Le catalogue : nom, catégorie, prix, origine, une phrase par produit.
8. Les services ou ateliers à réserver (durée, prix, jour, nombre de places).
9. 3 ou 4 avis de clients, avec nom et métier.
10. 3 sujets d'articles, et 5 questions fréquentes.
11. Coordonnées et horaires.

---

## 5. Passer en production

Le site de démonstration n'envoie rien. Pour un vrai client :
- **Formulaires** (contact, lettre d'information, réservation) : remplacer le contenu des gestionnaires `onsubmit` par un appel `fetch()` vers le service choisi (Formspree, Brevo, un back-office).
- **Panier** : brancher le bouton « Valider la commande » (`#checkout`) sur un lien de paiement (Stripe Payment Links, Shopify Buy Button…).
- **Mentions** : remplacer `demoNotice` et ajouter les mentions légales et la politique de confidentialité.
