const functions = require('firebase-functions');
const admin = require('firebase-admin');
const shortid = require('shortid');

admin.initializeApp();
const db = admin.database();

function validateInput(input) {
    if (input.fiddle === undefined)
        throw new functions.https.HttpsError('invalid-argument', 'Empty fiddle');
}

function validateContext(context) { }

exports.createFiddle = functions.https.onCall(async (data, context) => {
    // validateInput(data);
    // validateContext(context);

    const RETRIES = 10;

    for (let i = 0; i < RETRIES; i++) {
        let id = shortid.generate();
        const dbData = await db.ref(`/fiddle/${id}`).once('value');

        if (dbData.exists() !== true) {
            const newRecord = {
                id,
                created: new Date().getTime(),
                fiddle: data,
                views: 1
            }
            db.ref(`/fiddle/${id}`).set(newRecord);

            return newRecord;
        }
    }
});

exports.updateFiddle = functions.https.onCall(async (data, context) => {
    if (!data.id)
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Id');

    // validateInput(data);
    // validateContext(context);

    const { id, fiddle } = data;
    const ref = db.ref(`/fiddle/${id}`);
    const dbData = await ref.once('value');

    if (dbData.exists() === true) {
        const record = dbData.val();
        await ref.update({
            fiddle,
            modified: new Date().getTime(),
        });

        return { ...data, viewCount: record.viewCount };
    } else {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Id');
    }
});

exports.getFiddle = functions.https.onCall(async (data, context) => {
    if (!data.id)
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Id');

    const { id } = data;
    const ref = db.ref(`/fiddle/${id}`);
    const dbRecord = await ref.once('value');

    if (dbRecord.exists() === true) {
        let data = dbRecord.val();

        // Update number of hits
        ref.child('viewCount').transaction(function (hits) {
            return (hits || 0) + 1;
        });

        return data;
    } else {
        throw new functions.https.HttpsError('not-found');
    }
});

exports.fetchAd = functions.https.onCall(async (data, context) => {
    const adRef = db.ref('/ads/');
    const lastIndex = (await adRef.child('lastIndex').once('value')).val();
    const campaignsRecord = await adRef.child('/campaigns').once('value');
    const campaigns = campaignsRecord.val();

    const newIndex = (lastIndex + 1) % campaigns.length;
    adRef.update({ lastIndex: newIndex });

    const adToServe = campaigns[newIndex];

    adRef.child(`${newIndex}/viewCount`).transaction(function (views) {
        return (views || 0) + 1;
    });

    return adToServe;
});