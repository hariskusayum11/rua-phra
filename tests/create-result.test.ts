import test from "node:test";
import assert from "node:assert/strict";
import {creatorName,CREATE_STORAGE_KEYS} from "../src/lib/create/result";
test("creator names retain Thai, bound length and remove control/markup characters",()=>{
 assert.equal(creatorName("  ศิลป์ ปากพะยูน  "),"ศิลป์ ปากพะยูน");
 assert.equal(creatorName("<test>\n"),"test");
 assert.equal(creatorName("fuck"),"***");
 assert.equal(creatorName("ก".repeat(80)).length,40);
});
test("restart clears only game-specific keys",()=>{assert.equal(CREATE_STORAGE_KEYS.length,4);assert.ok(CREATE_STORAGE_KEYS.every(k=>k.startsWith("ruaphra-")));});
