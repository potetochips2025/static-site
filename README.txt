SPARKS WEBSITE - how to put it on GitHub Pages (about 10 minutes)

1. Sign in at github.com and click New repository. Name it sparks-site (public). Click Create repository.
2. On the new repository page click "uploading an existing file".
3. Unzip SparkVegeance_Website.zip on your PC. Open the folder "sparks-site".
4. Select EVERYTHING inside it (all .html files, the assets folder, CNAME, robots.txt, sitemap.xml, .nojekyll) and drag it into the GitHub page.
   Tip: if the hidden files .nojekyll does not appear, it is fine to skip it.
5. Click Commit changes.
6. Go to Settings > Pages. Under "Build and deployment" choose Source: Deploy from a branch, Branch: main, Folder: / (root). Click Save.
7. In the same Pages screen, under Custom domain, type sparks.stream and Save. Tick "Enforce HTTPS" when it becomes available.
8. At your domain/DNS provider add these records for sparks.stream:
   A  @  185.199.108.153
   A  @  185.199.109.153
   A  @  185.199.110.153
   A  @  185.199.111.153
   CNAME  www  YOUR-GITHUB-USERNAME.github.io
   (If the domain is on Cloudflare, set the records to "DNS only" until HTTPS is issued.)
9. After it is live, open https://search.google.com/search-console, add sparks.stream and submit https://sparks.stream/sitemap.xml.

Editing later: the text of every page is in build.py (needs Python). Or open any .html file in Notepad and edit the words between the tags.
