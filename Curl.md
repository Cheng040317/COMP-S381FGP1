

### 使用 `curl` 测试 CRUD

#### 1. 创建一个 Topic
```bash
curl -X POST http://localhost:3005/topics \
-H "Content-Type: application/json" \
-d '{"title": "First Topic", "content": "This is the content of the first topic."}'
```

#### 2. 获取所有 Topics
```bash
curl -X GET http://localhost:3005/topics
```


#### 3. 更新一个 Topic
```bash
curl -X PUT http://localhost:3005/topics/<TOPIC_ID> \
-H "Content-Type: application/json" \
-d '{"title": "Updated Topic", "content": "Updated content."}'
```

#### 4. 删除一个 Topic
```bash
curl -X DELETE http://localhost:3005/topics/<TOPIC_ID>
```

---

