/*
 * Copyright (C) 2022 Dremio
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import io.github.zenhelix.gradle.plugin.extension.PublishingType
import java.time.Duration

plugins {
  `java-library`
  `maven-publish`
  signing
  id("nessie-ui-conventions")
  id("io.github.zenhelix.maven-central-publish") version "0.11.2"
}

description = "Nessie Web UI"

val syncResources = tasks.register<Sync>("syncWebResources") {
  from("../build")
  into("build/resources/main/META-INF/resources")
}

tasks.withType<Jar>().configureEach {
  dependsOn(syncResources)
  manifest {
    attributes["Implementation-Title"] = "Nessie ${project.name}"
    attributes["Implementation-Version"] = project.version
    attributes["Implementation-Vendor"] = "Dremio"
  }
  duplicatesStrategy = DuplicatesStrategy.WARN
}

plugins.withType<JavaPlugin>().configureEach {
  configure<JavaPluginExtension> {
    withJavadocJar()
    withSourcesJar()
  }
}

// Pass environment variables:
//    ORG_GRADLE_PROJECT_sonatypeUsername
//    ORG_GRADLE_PROJECT_sonatypePassword
// Gradle targets:
//    publishAggregateMavenCentralDeployment
//    (zipAggregateMavenCentralDeployment to just generate the single, aggregated deployment zip)
// Ref: Maven Central Publisher API:
//    https://central.sonatype.org/publish/publish-portal-api/#uploading-a-deployment-bundle
mavenCentralPortal {
  credentials {
    username.value(provider { System.getenv("ORG_GRADLE_PROJECT_sonatypeUsername") })
    password.value(provider { System.getenv("ORG_GRADLE_PROJECT_sonatypePassword") })
  }

  deploymentName = "${project.name}-$version"

  // publishingType
  //   AUTOMATIC = fully automatic release
  //   USER_MANAGED = user has to manually publish/drop
  publishingType =
    if (System.getenv("CI") != null) PublishingType.AUTOMATIC else PublishingType.USER_MANAGED
  // baseUrl = "https://central.sonatype.com"
  uploader {
    // 2 seconds * 3600 = 7200 seconds = 2hrs
    delayRetriesStatusCheck = Duration.ofSeconds(2)
    maxRetriesStatusCheck = 3600

    aggregate {
      // Aggregate submodules into a single archive
      modules = false
      // Aggregate publications into a single archive for each module
      modulePublications = false
    }
  }
}

tasks.withType<JavaCompile>().configureEach { options.release.set(8) }
