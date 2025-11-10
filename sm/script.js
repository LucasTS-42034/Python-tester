const JUDGE0_URL = "http://judge.darlon.com.br";

document.getElementById('addTestCase').addEventListener('click', function() {
    const testCasesDiv = document.getElementById('testCases');
    const newTestCase = document.createElement('div');
    newTestCase.className = 'test-case';
    newTestCase.innerHTML = `
        <label>Entrada (stdin):</label>
        <input type="text" class="stdin" placeholder="Ex: 10 15">
        <label>Saída Esperada:</label>
        <input type="text" class="expected" placeholder="Ex: 25">
        <button type="button" class="removeTestCase">Remover</button>
    `;
    testCasesDiv.appendChild(newTestCase);
});

document.getElementById('testCases').addEventListener('click', function(e) {
    if (e.target.classList.contains('removeTestCase')) {
        e.target.parentElement.remove();
    }
});

document.getElementById('codeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const sourceCode = document.getElementById('sourceCode').value;
    const languageId = document.getElementById('language').value;
    const testCases = document.querySelectorAll('.test-case');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Executando testes...</p>';

    const results = [];
    for (let i = 0; i < testCases.length; i++) {
        const stdin = testCases[i].querySelector('.stdin').value;
        const expected = testCases[i].querySelector('.expected').value;
        const result = await runTest(sourceCode, languageId, stdin, expected);
        results.push({ test: i + 1, stdin, expected, ...result });
    }

    displayResults(results);
});

async function runTest(sourceCode, languageId, stdin, expected) {
    const encodedSource = btoa(sourceCode);
    const encodedStdin = btoa(stdin);

    const payload = {
        source_code: encodedSource,
        language_id: parseInt(languageId),
        stdin: encodedStdin,
        base64_encoded: true,
        wait: true
    };

    try {
        const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        const stdout = atob(result.stdout || '').trim();
        const stderr = atob(result.stderr || '').trim();
        const status = result.status.description;
        const passed = status === 'Accepted' && stdout === expected.trim();
        return { stdout, stderr, status, passed };
    } catch (error) {
        alert('Erro na execução: ' + error.message);
        console.log(error);
        return { error: error.message, passed: false };
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h3>Resultados dos Testes</h3>';
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'result ' + (result.passed ? 'pass' : 'fail');
        div.innerHTML = `
            <p><strong>Teste ${result.test}:</strong></p>
            <p>Entrada: ${result.stdin}</p>
            <p>Saída Esperada: ${result.expected}</p>
            <p>Saída Obtida: ${result.stdout || 'Erro'}</p>
            <p>Status: ${result.status || 'Erro'}</p>
            <p>Resultado: ${result.passed ? 'PASSOU' : 'FALHOU'}</p>
            ${result.stderr ? `<p>Erros: ${result.stderr}</p>` : ''}
        `;
        resultsDiv.appendChild(div);
    });
}
